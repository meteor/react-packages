import { useEffect } from 'react'
import { EJSON } from 'meteor/ejson'
import { Meteor } from 'meteor/meteor'
import isEqual from 'lodash.isequal'
import remove from 'lodash.remove'

const cachedSubscriptions: Entry[] = []

interface Entry {
  params: EJSON[]
  name: string
  handle?: Meteor.SubscriptionHandle
  promise: Promise<void>
  result?: null
  error?: unknown
}

export function useSubscribeSuspense(name: string, ...params: EJSON[]) {
  const cachedSubscription =
    cachedSubscriptions.find(x => x.name === name && isEqual(x.params, params))

  useEffect(() =>
    () => {
      setTimeout(() => {
        if (cachedSubscription != null) {
          cachedSubscription?.handle?.stop()
          remove(cachedSubscriptions, x => isEqual(x, cachedSubscription))
        }
      }, 0)
    }, [name, ...params])

  if (cachedSubscription != null) {
    if ('error' in cachedSubscription) throw cachedSubscription.error
    if ('result' in cachedSubscription) return cachedSubscription.result
    throw cachedSubscription.promise
  }

  const subscription: Entry = {
    name,
    params,
    promise: new Promise<Meteor.SubscriptionHandle>((resolve, reject) => {
      const h = Meteor.subscribe(name, ...params, {
        onReady() {
          subscription.result = null
          subscription.handle = h
          resolve(h)
        },
        onStop(error: unknown) {
          subscription.error = error
          subscription.handle = h
          reject(error)
        }
      })
    })
  }

  cachedSubscriptions.push(subscription)

  throw subscription.promise
}

export const useSubscribe = useSubscribeSuspense
