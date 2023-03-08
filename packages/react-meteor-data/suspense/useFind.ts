import { Meteor } from 'meteor/meteor'
import { type Mongo } from 'meteor/mongo'
import { useEffect } from 'react'
import { useFind as useFindClient } from '../useFind'

export const selectorsCache = new Map<string, SelectorEntry>()
const deferDelete = (name: string, time = 0) => {
  setTimeout(() => {
    selectorsCache.delete(name)
  }, time)
}

interface SelectorEntry {
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
      if (index !== -1) {
        list.splice(index, 1)
      }
    }
  }
const useFindSuspense = <T = any>(
  key: string,
  collection: Mongo.Collection<T>,
  findArgs: Parameters<Mongo.Collection<T>['find']> | null
) => {
  useEffect(() => {
    const selector = selectorsCache.get(key) ?? null
    if (selector != null) ++selector.counter
    return () => {
      setTimeout(() => {
        const selector = selectorsCache.get(key) ?? null
        if ((selector != null) && (--selector.counter === 0)) selectorsCache.delete(key)
      }, 0)
    }
  }, [key, findArgs, collection])

  useEffect(() => {
    // cached selector is not valid anymore
    deferDelete(key)
    return () => {
      deferDelete(key)
    }
  }, [key, findArgs])

  if (findArgs === null) return null

  const cachedSelector = selectorsCache.get(key)

  if (cachedSelector != null) {
    if ('error' in cachedSelector) throw cachedSelector.error
    if ('result' in cachedSelector) return cachedSelector.result as T[]
    throw cachedSelector.promise
  }

  const selector: SelectorEntry = {
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
  selectorsCache.set(key, selector)

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
