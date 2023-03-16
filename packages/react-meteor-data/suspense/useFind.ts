import { Meteor } from 'meteor/meteor'
import { type Mongo } from 'meteor/mongo'
import type React from 'react'
import { useEffect } from 'react'
import { useFind as useFindClient } from '../useFind'
import isEqual from 'lodash.isequal'
import remove from 'lodash.remove'
export const cacheMap = new Map<Mongo.Collection<unknown>, Entry[]>()

interface Entry {
  findArgs: Parameters<Mongo.Collection<unknown>['find']>
  promise: Promise<unknown>
  result?: unknown
  error?: unknown
  counter: number

}

const removeNullCaches =
  (cacheMap: Map<Mongo.Collection<unknown, unknown>, Entry[]>) => {
    for (const cache of cacheMap.values()) {
      remove(cache, c => c.counter === 0)
    }
  }
const useFindSuspense = <T = any>(
  collection: Mongo.Collection<T>,
  findArgs: Parameters<Mongo.Collection<T>['find']> | null,
  deps: React.DependencyList = []
) => {
  useEffect(() => {
    const cachedEntries = cacheMap.get(collection)
    const entry = cachedEntries?.find(x => isEqual(x.findArgs, findArgs))
    if (entry) ++entry.counter

    removeNullCaches(cacheMap)
    return () => {
      setTimeout(() => {
        const cachedEntries = cacheMap.get(collection)
        const entry = cachedEntries?.find(x => isEqual(x.findArgs, findArgs))

        if (entry) --entry.counter

        removeNullCaches(cacheMap)
      }, 0)
    }
  }, [findArgs, collection, ...deps])

  if (findArgs === null) return null

  const cachedEntries = cacheMap.get(collection)
  const cachedEntry = cachedEntries?.find(x => isEqual(x.findArgs, findArgs))

  if (cachedEntry != null) {
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
        }),
    counter: 0
  }

  if (cachedEntries != null) cachedEntries.push(entry)
  else cacheMap.set(collection, [entry])

  throw entry.promise
}

export { useFindSuspense }

export const useFind = Meteor.isClient
  ? useFindClient
  : useFindSuspense

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

  return useFindSuspense(collection, findArgs, deps)
}

export default Meteor.isDevelopment
  ? useFindDev
  : useFind
