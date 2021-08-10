import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { useReducer, useMemo, useEffect, Reducer, DependencyList, useRef } from 'react'
import { Tracker } from 'meteor/tracker'

type useFindActions<T> =
  | { type: 'refresh', data: T[] }
  | { type: 'addedAt', document: T, atIndex: number }
  | { type: 'changedAt', document: T, atIndex: number }
  | { type: 'removedAt', atIndex: number }
  | { type: 'movedTo', fromIndex: number, toIndex: number }

const useFindReducer = <T>(data: T[], action: useFindActions<T>): T[] => {
  switch (action.type) {
    case 'refresh':
      return action.data
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

const checkCursor = <T>(cursor: Mongo.Cursor<T>) => {
  if (!(cursor instanceof Mongo.Cursor)) {
    console.warn(
      'Warning: useFind requires an instance of Mongo.Cursor. '
      + 'Make sure you do NOT call .fetch() on your cursor.'
    );
  }
}

const useFindClient = <T = any>(factory: () => Mongo.Cursor<T>, deps: DependencyList = []) => {
  let [data, dispatch] = useReducer<Reducer<T[], useFindActions<T>>>(
    useFindReducer,
    []
  )

  const { current: refs } = useRef<{ committed: Boolean, data: T[] }>({ committed: false, data: [] })

  const cursor = useMemo(() => (
    // To avoid creating side effects in render, opt out
    // of Tracker integration altogether.
    Tracker.nonreactive(() => {
      refs.committed = false
      const c = factory()
      if (Meteor.isDevelopment) {
        checkCursor(c)
      }
      refs.data = c.fetch()
      return c
    })
  ), deps)

  useEffect(() => {
    refs.committed = true

    // Refetch the data in case an update happened
    // between first render and commit. Additionally,
    // update in response to deps change.
    const data = Tracker.nonreactive(() => cursor.fetch())

    dispatch({
      type: 'refresh',
      data: data
    })

    const observer = cursor.observe({
      addedAt (document, atIndex, before) {
        dispatch({ type: 'addedAt', document, atIndex })
      },
      changedAt (newDocument, oldDocument, atIndex) {
        dispatch({ type: 'changedAt', document: newDocument, atIndex })
      },
      removedAt (oldDocument, atIndex) {
        dispatch({ type: 'removedAt', atIndex })
      },
      movedTo (document, fromIndex, toIndex, before) {
        dispatch({ type: 'movedTo', fromIndex, toIndex })
      },
      // @ts-ignore
      _suppress_initial: true
    })

    return () => {
      observer.stop()
    }
  }, [cursor])

  return !refs.committed ? refs.data : data
}

const useFindServer = <T = any>(factory: () => Mongo.Cursor<T>, deps: DependencyList) => (
  Tracker.nonreactive(() => {
    const cursor = factory()
    if (Meteor.isDevelopment) checkCursor(cursor)
    return cursor.fetch()
  })
)

export const useFind = Meteor.isServer
  ? useFindServer
  : useFindClient

function useFindDev (reactiveFn, deps = null, skipUpdate = null) {
  function warn (expects: string, pos: string, arg: string, type: string) {
    console.warn(
      `Warning: useFind expected a ${expects} in it\'s ${pos} argument `
        + `(${arg}), but got type of \`${type}\`.`
    );
  }

  if (typeof reactiveFn !== 'function') {
    warn("function", "1st", "reactiveFn", reactiveFn);
  }

  if (!deps || !Array.isArray(deps)) {
    warn("array", "2nd", "deps", typeof deps);
  }

  return useFind(reactiveFn, deps);
}

export default Meteor.isDevelopment
  ? useFindDev as typeof useFindClient
  : useFind;
