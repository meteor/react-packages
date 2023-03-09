import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { useEffect } from 'react'
import {useFind as useFindClient} from '../useFind'
import isEqual from 'lodash/isEqual'

export const cacheMap = new Map<Mongo.Collection<unknown>, Entry[]>()
interface Entry {
  findArgs: Parameters<Mongo.Collection<unknown>['find']>
  promise: Promise<unknown>
  result?: unknown
  error?: unknown
  counter: number

}
export const removeFromArray =
  <T>(list: T[], obj: T): void => {
    if (obj) {
      const index = list.indexOf(obj)
      if (index !== -1) list.splice(index, 1)
    }
  }

const removeNullCaches =
  (cacheMap: Map<Mongo.Collection<unknown, unknown>, Entry[]>) => {
    for (const cache of cacheMap.values()) {
      cache
        .filter(c => c.counter === 0)
        .forEach(c => { removeFromArray(cache, c) })
    }
  }
const useFindSuspense = <T = any>(
  collection: Mongo.Collection<T>,
  findArgs: Parameters<Mongo.Collection<T>['find']> | null
) => {
  useEffect(() => {
    const cachedSelectors = cacheMap.get(collection)
    const selector = cachedSelectors?.find(x => isEqual(x.findArgs, findArgs))
    if (selector != null) ++selector.counter

    removeNullCaches(cacheMap)
    return () => {
      // defer
      setTimeout(() => {
        const cachedSelectors = cacheMap.get(collection)
        const selector = cachedSelectors?.find(x => isEqual(x.findArgs, findArgs))

        if ((selector != null) && --selector.counter === 0) removeFromArray(cachedSelectors, selector)

        removeNullCaches(cacheMap)
      }, 0)
    }
  }, [findArgs, collection])

  if (findArgs === null) return null

  const cachedSelectors = cacheMap.get(collection)
  const cachedSelector = cachedSelectors?.find(x => isEqual(x.findArgs, findArgs))

  if (cachedSelector != null) {
    if ('error' in cachedSelector) throw cachedSelector.error
    if ('result' in cachedSelector) return cachedSelector.result as T[]
    throw cachedSelector.promise
  }

  const selector: Entry = {
    findArgs,
    promise: collection
      .find(...findArgs)
      .fetchAsync()
      .then(
        result => {
          selector.result = result
        },
        error => {
          selector.error = error
        }),
    counter: 0
  }

  if (cachedSelectors != null) cachedSelectors.push(selector)
  else cacheMap.set(collection, [selector])

  throw selector.promise
}

export { useFindSuspense }

export const useFind = Meteor.isClient
  ? useFindClient
  : useFindSuspense

function useFindDev<T = any>(
  collection: Mongo.Collection<T>,
  findArgs: Parameters<Mongo.Collection<T>['find']> | null) {
  function warn(expects: string, pos: string, arg: string, type: string) {
    console.warn(
      `Warning: useFind expected a ${expects} in it\'s ${pos} argument ` +
      `(${arg}), but got type of \`${type}\`.`
    )
  }

  if (typeof collection !== 'object') {
    warn('Mongo Collection', '1st', 'reactiveFn', collection)
  }

  return useFindSuspense(collection, findArgs)
}

export default Meteor.isDevelopment
  ? useFindDev
  : useFind
