import { useEffect } from 'react';
import { EJSON } from 'meteor/ejson';
import { Meteor } from 'meteor/meteor';

import isEqual from 'lodash/isEqual';
import { removeFromArray } from "./useFind";

const cachedSubscriptions: SubscriptionEntry[] = [];
type SubscriptionEntry = {
  params: EJSON[];
  name: string;
  handle?: Meteor.SubscriptionHandle;
  promise: Promise<Meteor.SubscriptionHandle>;
  result?: unknown;
  error?: unknown;
};

export function useSubscribeSuspense(name: string, ...params: EJSON[]) {
  const cachedSubscription = cachedSubscriptions.find(x => x.name === name && isEqual(x.params, params));

  useEffect(() => {
    return () => {
      setTimeout(() => {
        if (cachedSubscription) {
          cachedSubscription?.handle?.stop();
          removeFromArray(cachedSubscriptions, cachedSubscription);
        }
      }, 0)
    }
  }, [name, ...params])

  if (cachedSubscription) {
    if ('error' in cachedSubscription) {
      throw cachedSubscription.error;
    }
    if ('result' in cachedSubscription) {
      return cachedSubscription.result;
    }
    throw cachedSubscription.promise;
  }

  const subscription: SubscriptionEntry = {
    name,
    params,
    promise: new Promise<Meteor.SubscriptionHandle>((resolve, reject) => {
      const h = Meteor.subscribe(name, ...params, {
        onReady() {
          subscription.result = null;
          subscription.handle = h
          resolve(h);
        },
        onStop(error: unknown) {
          subscription.error = error;
          subscription.handle = h
          reject(h);
        },
      });
    }),
  };

  cachedSubscriptions.push(subscription);

  throw subscription.promise;
}

export const useSubscribe = useSubscribeSuspense
