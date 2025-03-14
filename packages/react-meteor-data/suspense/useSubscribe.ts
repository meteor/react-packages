import { useEffect, useRef } from 'react'
import { EJSON } from 'meteor/ejson'
import { Meteor } from 'meteor/meteor'

const cachedSubscriptions = new Map<string, Entry>();

interface Entry {
  params: EJSON[]
  name: string
  handle?: Meteor.SubscriptionHandle
  promise: Promise<void>
  result?: null
  error?: unknown
}

const useSubscribeSuspenseClient = (name: string, ...params: EJSON[]) => {
  const subscribeKey = EJSON.stringify([name, params]);
  const cachedSubscription = cachedSubscriptions.get(subscribeKey);
  const cleanupTimoutIdRefs = useRef(new Map());

  useEffect(() => {
    /**
     * In strict mode (development only), `useEffect` may run 1-2 times.
     * Throwing a promise outside can cause premature cleanup of subscriptions and cachedSubscription before unmount.
     * To avoid this, check the `timeout` to ensure cleanup only occurs after unmount.
     */
    if (cleanupTimoutIdRefs.current.has(subscribeKey)) {
      clearTimeout(cleanupTimoutIdRefs.current.get(subscribeKey));
      cleanupTimoutIdRefs.current.delete(subscribeKey);
    }

    return () => {
      cleanupTimoutIdRefs.current.set(
        subscribeKey,
        setTimeout(() => {
          const cachedSubscription = cachedSubscriptions.get(subscribeKey);

          if (cachedSubscription) {
            cachedSubscription.handle?.stop();
            cachedSubscriptions.delete(subscribeKey);
            cleanupTimoutIdRefs.current.delete(subscribeKey);
          }
        }, 0)
      );
    };
  }, [subscribeKey]);

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

  cachedSubscriptions.set(subscribeKey, subscription)

  throw subscription.promise
}

const useSubscribeSuspenseServer = (name?: string, ...args: any[]) => undefined;

export const useSubscribeSuspense = Meteor.isServer
  ? useSubscribeSuspenseServer
  : useSubscribeSuspenseClient

export const useSubscribe = useSubscribeSuspense
