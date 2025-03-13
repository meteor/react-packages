import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { useReducer, useMemo, useEffect, Reducer, DependencyList } from 'react'
import { Tracker } from 'meteor/tracker'

type useFindActions<T> =
  | { type: 'refresh', data: T[] }
  | { type: 'addedAt', document: T, atIndex: number }
  | { type: 'changedAt', document: T, atIndex: number }
  | { type: 'removedAt', atIndex: number }
  | { type: 'movedTo', fromIndex: number, toIndex: number }

  // Should I put this in a utils file?
  const shallowEqual = (a: any, b: any) => {
    if (a === b) return true;
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (a[key] !== b[key]) return false;
    }
    return true;
  };
  const mergeRefreshData = <T>(oldData: T[], newData: T[]): T[] => {
    if (oldData.length !== newData.length) return newData;
  
    let changed = false;
    const merged: T[] = new Array(newData.length);
    const oldDocs = new Map(oldData.map(doc => [(doc as any).id, doc]));
    // This verification is necessary for reference stability between rerenders
    for (let i = 0; i < newData.length; i++) {
      const newDoc = newData[i];
      const oldDoc = oldDocs.get((newDoc as any).id);
      if (oldDoc && shallowEqual(oldDoc, newDoc)) {
        merged[i] = oldDoc;
      } else {
        merged[i] = newDoc;
        changed = true;
      }
    }
    return changed ? merged : oldData;
  }
// -------

const useFindReducer = <T>(data: T[], action: useFindActions<T>): T[] => {
  switch (action.type) {
    case 'refresh': 
      return mergeRefreshData(data, action.data);
    case 'addedAt':
      return [
        ...data.slice(0, action.atIndex),
        action.document,
        ...data.slice(action.atIndex)
      ]
    case 'changedAt':
      return [
        ...data.slice(0, action.atIndex),
        action.document,
        ...data.slice(action.atIndex + 1)
      ]
    case 'removedAt':
      return [
        ...data.slice(0, action.atIndex),
        ...data.slice(action.atIndex + 1)
      ]
    case 'movedTo':
      const doc = data[action.fromIndex]
      const copy = [
        ...data.slice(0, action.fromIndex),
        ...data.slice(action.fromIndex + 1)
      ]
      copy.splice(action.toIndex, 0, doc)
      return copy
  }
}

// Check for valid Cursor or null.
// On client, we should have a Mongo.Cursor (defined in
// https://github.com/meteor/meteor/blob/devel/packages/minimongo/cursor.js and
// https://github.com/meteor/meteor/blob/devel/packages/mongo/collection.js).
// On server, however, we instead get a private Cursor type from
// https://github.com/meteor/meteor/blob/devel/packages/mongo/mongo_driver.js
// which has fields _mongo and _cursorDescription.
const checkCursor = <T>(cursor: Mongo.Cursor<T> | Partial<{ _mongo: any, _cursorDescription: any }> | undefined | null) => {
  if (cursor !== null && cursor !== undefined && !(cursor instanceof Mongo.Cursor) &&
      !(cursor._mongo && cursor._cursorDescription)) {
    console.warn(
      'Warning: useFind requires an instance of Mongo.Cursor. '
      + 'Make sure you do NOT call .fetch() on your cursor.'
    );
  }
}

// Synchronous data fetch. It uses cursor observing instead of cursor.fetch() because synchronous fetch will be deprecated.
const fetchData = <T>(cursor: Mongo.Cursor<T>) => {
  const data: T[] = []
  const observer = cursor.observe({
    addedAt (document, atIndex, before) {
      data.splice(atIndex, 0, document)
    },
  })
  observer.stop()
  return data
}

const useFindClient = <T = any>(factory: () => (Mongo.Cursor<T> | undefined | null), deps: DependencyList = []) => {
  const cursor = useMemo(() => {
    // To avoid creating side effects in render, opt out
    // of Tracker integration altogether.
    const cursor = Tracker.nonreactive(factory);
    if (Meteor.isDevelopment) {
      checkCursor(cursor)
    }
    return cursor
  }, deps)

  const initialData = cursor instanceof Mongo.Cursor ? fetchData(cursor) : [];
  const [data, dispatch] = useReducer<Reducer<T[], useFindActions<T>>>(
    useFindReducer,
    initialData
  );


  useEffect(() => {
    if (!(cursor instanceof Mongo.Cursor)) {
      return
    }
    
    const newData = fetchData(cursor);
    dispatch({ type: 'refresh', data: newData });
    
    const observer = cursor.observe({
      addedAt(document, atIndex) {
        dispatch({ type: 'addedAt', document, atIndex })
      },
      changedAt(newDocument, _oldDocument, atIndex) {
        dispatch({ type: 'changedAt', document: newDocument, atIndex })
      },
      removedAt(_oldDocument, atIndex) {
        dispatch({ type: 'removedAt', atIndex });
      },
      movedTo(_document, fromIndex, toIndex) {
        dispatch({ type: 'movedTo', fromIndex, toIndex })
      },
      // @ts-ignore
      _suppress_initial: true
    })

    return () => {
      observer.stop()
    }
  }, [cursor])

  return cursor ? data : cursor
}

const useFindServer = <T = any>(factory: () => Mongo.Cursor<T> | undefined | null, deps: DependencyList) => (
  Tracker.nonreactive(() => {
    const cursor = factory()
    if (Meteor.isDevelopment) checkCursor(cursor)
    return cursor?.fetch?.() ?? null
  })
)

export const useFind = Meteor.isServer
  ? useFindServer
  : useFindClient

function useFindDev <T = any>(factory: () => (Mongo.Cursor<T> | undefined | null), deps: DependencyList = []) {
  function warn (expects: string, pos: string, arg: string, type: string) {
    console.warn(
      `Warning: useFind expected a ${expects} in it\'s ${pos} argument `
        + `(${arg}), but got type of \`${type}\`.`
    );
  }

  if (typeof factory !== 'function') {
    warn("function", "1st", "reactiveFn", factory);
  }

  if (!deps || !Array.isArray(deps)) {
    warn("array", "2nd", "deps", typeof deps);
  }

  return useFind(factory, deps);
}

export default Meteor.isDevelopment
  ? useFindDev
  : useFind;
