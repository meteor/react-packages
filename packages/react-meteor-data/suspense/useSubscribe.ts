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

const useSubscribeSuspenseClient = (name: string, ...params: EJSON[]) => {
  const cachedSubscription =
    cachedSubscriptions.find(x => x.name === name && isEqual(x.params, params))

  useEffect(() =>
    () => {
      setTimeout(() => {
        const cachedSubscription =
          cachedSubscriptions.find(x => x.name === name && isEqual(x.params, params))
        if (cachedSubscription) {
          cachedSubscription.handle?.stop()
        }
      }, 0)
    }, [name, EJSON.stringify(params)])

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
          if (!error) {
            remove(cachedSubscriptions,
              x =>
                x.name === subscription.name &&
                isEqual(x.params, subscription.params))
          }
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

const useSubscribeSuspenseServer = (name?: string, ...args: any[]) => undefined;

export const useSubscribeSuspense = Meteor.isServer
? useSubscribeSuspenseServer
: useSubscribeSuspenseClient

export const useSubscribe = useSubscribeSuspense
