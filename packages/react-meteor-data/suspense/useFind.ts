import { Meteor } from 'meteor/meteor'
import { EJSON } from 'meteor/ejson'
import { Mongo } from 'meteor/mongo'
import type React from 'react'
import { useMemo, useSyncExternalStore, type DependencyList } from 'react'
import { Tracker } from 'meteor/tracker'

type useFindActions<T> =
    | { type: 'addedAt', document: T, atIndex: number }
    | { type: 'changedAt', document: T, atIndex: number }
    | { type: 'removedAt', atIndex: number }
    | { type: 'movedTo', fromIndex: number, toIndex: number }

const useFindReducer = <T>(data: T[], action: useFindActions<T>): T[] => {
  switch (action.type) {
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
const checkCursor = <T,>(
  cursor:
  | Mongo.Cursor<T>
  | Partial<{ _mongo: any, _cursorDescription: any }>
  | undefined
  | null
) => {
  if (
    cursor !== null &&
      cursor !== undefined &&
      !(cursor instanceof Mongo.Cursor) &&
      !(cursor._mongo && cursor._cursorDescription)
  ) {
    console.warn(
      'Warning: useFind requires an instance of Mongo.Cursor. ' +
        'Make sure you do NOT call .fetch() on your cursor.'
    )
  }
}

// Synchronous data fetch. It uses cursor observing instead of cursor.fetch() because synchronous fetch will be deprecated.
const fetchData = <T>(cursor: Mongo.Cursor<T>) => {
  const data: T[] = []
  const observer = cursor.observe({
    addedAt(document, atIndex, before) {
      data.splice(atIndex, 0, document)
    }
  })
  observer.stop()
  return data
}

export const useFindSuspenseClient = <T = any>(
  collection: Mongo.Collection<T>,
  findArgs: Parameters<Mongo.Collection<T>['find']> | null,
  deps: DependencyList = []
) => {
  const findArgsKey = EJSON.stringify(findArgs)

  const cursor = useMemo(() => {
    // To avoid creating side effects in render, opt out
    // of Tracker integration altogether.
    const cursor = Tracker.nonreactive(() => findArgs && collection.find(...findArgs))
    if (Meteor.isDevelopment) {
      checkCursor(cursor)
    }
    return cursor
  }, [findArgsKey, ...deps])

  // One store per cursor. The snapshot is computed synchronously during render,
  // so the first render after a cursor change already returns the new data.
  const store = useMemo(() => {
    let snapshot: T[] = cursor instanceof Mongo.Cursor ? fetchData(cursor) : []

    const getSnapshot = () => snapshot

    const subscribe = (onStoreChange: () => void) => {
      if (!(cursor instanceof Mongo.Cursor)) {
        return () => {}
      }

      // Catch up on changes that happened between render and subscribe.
      const next = fetchData(cursor)
      if (!EJSON.equals(snapshot, next)) {
        snapshot = next
        onStoreChange()
      }

      const observer = cursor.observe({
        addedAt(document, atIndex, before) {
          snapshot = useFindReducer(snapshot, { type: 'addedAt', document, atIndex })
          onStoreChange()
        },
        changedAt(newDocument, oldDocument, atIndex) {
          snapshot = useFindReducer(snapshot, { type: 'changedAt', document: newDocument, atIndex })
          onStoreChange()
        },
        removedAt(oldDocument, atIndex) {
          snapshot = useFindReducer(snapshot, { type: 'removedAt', atIndex })
          onStoreChange()
        },
        movedTo(document, fromIndex, toIndex, before) {
          snapshot = useFindReducer(snapshot, { type: 'movedTo', fromIndex, toIndex })
          onStoreChange()
        },
        // @ts-expect-error
        _suppress_initial: true
      })

      return () => {
        observer.stop()
      }
    }

    return { getSnapshot, subscribe }
  }, [cursor])

  // getServerSnapshot is required during hydration; without it React throws
  // and falls back to client rendering for the whole Suspense boundary.
  const data = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)

  return cursor ? data : cursor
}

interface Entry {
  findArgs: Parameters<Mongo.Collection<unknown>['find']>
  promise: Promise<unknown>
  result?: unknown
  error?: unknown
}

const cacheMap = new Map<Mongo.Collection<unknown>, Map<string, Entry>>()

export const useFindSuspenseServer = <T = any>(
  collection: Mongo.Collection<T>,
  findArgs: Parameters<Mongo.Collection<T>['find']> | null,
  deps: React.DependencyList = []
) => {
  if (findArgs === null) return null

  const cachedEntries = cacheMap.get(collection)
  const findArgsKey = EJSON.stringify(findArgs)
  const cachedEntry = cachedEntries?.get(findArgsKey)

  if (cachedEntry != null) {
    if ('error' in cachedEntry || 'result' in cachedEntry) {
      setTimeout(() => {
        if (cachedEntries) cachedEntries.delete(findArgsKey)
        else cacheMap.delete(collection)
      }, 0)
    }
    if ('error' in cachedEntry) throw cachedEntry.error
    if ('result' in cachedEntry) return cachedEntry.result as T[]
    throw cachedEntry.promise
  }

  const entry: Entry = {
    findArgs,
    promise: collection
      .find(...findArgs)
      .fetchAsync()
      .then(
        result => {
          entry.result = result
        },
        error => {
          entry.error = error
        }
      )
  }

  if (!cachedEntries) cacheMap.set(collection, new Map([[findArgsKey, entry]]))
  else cachedEntries.set(findArgsKey, entry)

  throw entry.promise
}

export const useFind = Meteor.isServer
  ? useFindSuspenseServer
  : useFindSuspenseClient

function useFindDev<T = any>(
  collection: Mongo.Collection<T>,
  findArgs: Parameters<Mongo.Collection<T>['find']> | null,
  deps: React.DependencyList = []
) {
  function warn(expects: string, pos: string, arg: string, type: string) {
    console.warn(
        `Warning: useFind expected a ${expects} in it\'s ${pos} argument ` +
        `(${arg}), but got type of \`${type}\`.`
    )
  }

  if (typeof collection !== 'object') {
    warn('Mongo Collection', '1st', 'reactiveFn', collection)
  }

  return useFind(collection, findArgs, deps)
}

export default Meteor.isDevelopment
  ? useFindDev
  : useFind
