import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { useEffect } from 'react'
import isEqual from 'lodash/isEqual';
import clone from 'lodash/clone'


export const selectorsCache = new Map<Mongo.Collection<unknown>, SelectorEntry[]>();
type SelectorEntry = {
  findArgs: Parameters<Mongo.Collection<unknown>['find']>;
  promise: Promise<unknown>;
  result?: unknown;
  error?: unknown;
  counter: number;

};
export const removeFromArray =
  <T>(list: T[], obj: T): void => {
    if (obj) {
      const index = list.indexOf(obj);
      if (index !== -1) {
        list.splice(index, 1);
      }
    }
  }
const useFindSuspense = <T = any>(
  collection: Mongo.Collection<T>,
  findArgs: Parameters<Mongo.Collection<T>['find']> | null,
) => {
  useEffect(() => {
    const cachedSelectors = selectorsCache.get(collection) ?? [];
    const _args = clone(findArgs)
    const selector = cachedSelectors.find(x => isEqual(x.findArgs, _args));

    if (selector) ++selector.counter;

    return () => {
      // defer
      setTimeout(() => {
        const cachedSelectors = selectorsCache.get(collection) ?? [];
        const selector = cachedSelectors.find(x => isEqual(x.findArgs, _args));
        if (selector && --selector.counter === 0) {
          removeFromArray(cachedSelectors, selector);
          selectorsCache.set(collection, cachedSelectors);
        }
      }, 0)
    };
  }, [findArgs, collection]);

  useEffect(() => {
    return () => {
      // defer
      setTimeout(() => {
        const cachedSelectors = selectorsCache.get(collection) ?? [];
        if (
          findArgs === null && cachedSelectors.length > 0
        ) {
          for (const selector of cachedSelectors) {
            removeFromArray(cachedSelectors, selector);
          }
          selectorsCache.set(collection, cachedSelectors);
        }
      }, 0)
    }
  }, [findArgs])

  if (findArgs === null) return null

  const cachedSelectors = selectorsCache.get(collection) ?? [];
  const cachedSelector = cachedSelectors.find(x => isEqual(x.findArgs, findArgs));

  if (cachedSelector) {
    if ('error' in cachedSelector) {
      throw cachedSelector.error;
    }
    if ('result' in cachedSelector) {
      return cachedSelector.result as T[];
    }
    throw cachedSelector.promise;
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
          selector.error = error;
        }),
    counter: 0,
  };
  cachedSelectors.push(selector);
  selectorsCache.set(collection, cachedSelectors);

  throw selector.promise;
};

export { useFindSuspense }

export const useFind = useFindSuspense

function useFindDev<T = any>(
  collection: Mongo.Collection<T>,
  findArgs: Parameters<Mongo.Collection<T>['find']> | null) {
  function warn(expects: string, pos: string, arg: string, type: string) {
    console.warn(
      `Warning: useFind expected a ${ expects } in it\'s ${ pos } argument `
      + `(${ arg }), but got type of \`${ type }\`.`
    );
  }

  if (typeof collection !== 'object') {
    warn("Mongo Collection", "1st", "reactiveFn", collection);
  }

  return useFindSuspense(collection, findArgs);
}

export default Meteor.isDevelopment
  ? useFindDev
  : useFind;
