import { Meteor } from 'meteor/meteor'
import { EJSON } from 'meteor/ejson'
import { type Mongo } from 'meteor/mongo'
import type React from 'react'
import { useFind as useFindClient } from '../useFind'

const cacheMap = new Map<Mongo.Collection<unknown>, Map<string, Entry>>()

interface Entry {
  findArgs: Parameters<Mongo.Collection<unknown>['find']>
  promise: Promise<unknown>
  result?: unknown
  error?: unknown
}

const useFindSuspense = <T = any>(
  collection: Mongo.Collection<T>,
  findArgs: Parameters<Mongo.Collection<T>['find']> | null,
  deps: React.DependencyList = []
) => {
  if (findArgs === null) return null
  if (Meteor.isClient)
    throw new Error('useFindSuspense is only available on the server.')

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

export { useFindSuspense }

export const useFind = Meteor.isClient
  ? <T>(
      collection: Mongo.Collection<T>,
      findArgs: Parameters<Mongo.Collection<T>["find"]> | null,
      deps?: React.DependencyList
    ) => useFindClient(() => findArgs && collection.find(...findArgs), deps)
  : useFindSuspense;

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
