import { strictDeepEqual } from 'fast-equals'
import { Tracker } from 'meteor/tracker'
import { type EJSON } from 'meteor/ejson'
import { type DependencyList, useEffect, useMemo, useReducer, useRef } from 'react'
import { Meteor } from 'meteor/meteor'

function checkCursor(data: any): void {
  let shouldWarn = false
  if (Package.mongo && Package.mongo.Mongo && data && typeof data === 'object') {
    if (data instanceof Package.mongo.Mongo.Cursor) {
      shouldWarn = true
    } else if (Object.getPrototypeOf(data) === Object.prototype) {
      Object.keys(data).forEach((key) => {
        if (data[key] instanceof Package.mongo.Mongo.Cursor) {
          shouldWarn = true
        }
      })
    }
  }
  if (shouldWarn) {
    console.warn(
      'Warning: your reactive function is returning a Mongo cursor. ' +
      'This value will not be reactive. You probably want to call ' +
      '`.fetch()` on the cursor before returning it.'
    )
  }
}

export const cacheMap = new Map<string, Entry>()

interface Entry {
  deps: EJSON[]
  promise: Promise<unknown>
  result?: unknown
  error?: unknown
}

// Used to create a forceUpdate from useReducer. Forces update by
// incrementing a number whenever the dispatch method is invoked.
const fur = (x: number): number => x + 1
const useForceUpdate = () => useReducer(fur, 0)

export type IReactiveFn<T> = (c?: Tracker.Computation) => Promise<T>

export type ISkipUpdate<T> = <T>(prev: T, next: T) => boolean

function resolveAsync<T>(key: string, promise: Promise<T> | null, deps: DependencyList = []): typeof promise extends null ? null : T {
  const cached = cacheMap.get(key)
  useEffect(() =>
    () => {
      setTimeout(() => {
        if (cached !== undefined && strictDeepEqual(cached.deps, deps)) cacheMap.delete(key)
      }, 0)
    }, [cached, key, ...deps])

  if (promise === null) return null

  if (cached !== undefined) {
    if (Meteor.isServer && ('error' in cached || 'result' in cached)) {
      setTimeout(() => {
        cacheMap.delete(key)
      }, 0)
    }
    if ('error' in cached) throw cached.error
    if ('result' in cached) return cached.result as T
    throw cached.promise
  }

  const entry: Entry = {
    deps,
    promise: new Promise((resolve, reject) => {
      promise
        .then((result: any) => {
          entry.result = result
          resolve(result)
        })
        .catch((error: any) => {
          entry.error = error
          reject(error)
        })
    })
  }
  cacheMap.set(key, entry)
  throw entry.promise
}

export function useTrackerSuspenseNoDeps<T = any>(key: string, reactiveFn: IReactiveFn<T>, skipUpdate: ISkipUpdate<T> = null): T {
  const { current: refs } = useRef<{
    isMounted: boolean
    computation?: Tracker.Computation
    trackerData: any
    cleanupTimoutId?: number
  }>({
    isMounted: false,
    trackerData: null
  })
  const [, forceUpdate] = useForceUpdate()

  // Use Tracker.nonreactive in case we are inside a Tracker Computation.
  // This can happen if someone calls `ReactDOM.render` inside a Computation.
  // In that case, we want to opt out of the normal behavior of nested
  // Computations, where if the outer one is invalidated or stopped,
  // it stops the inner one.
  Tracker.nonreactive(() =>
    Tracker.autorun(async (comp: Tracker.Computation) => {
      if (refs.computation) {
        refs.computation.stop()
        delete refs.computation
      }

      refs.computation = comp

      const data: Promise<any> = Tracker.withComputation(comp, async () => reactiveFn(comp))

      if (comp.firstRun) {
        // Always run the reactiveFn on firstRun
        refs.trackerData = data
      } else {
        const dataResult = await data;

        if (!skipUpdate || !skipUpdate(await refs.trackerData, dataResult)) {
          const cached = cacheMap.get(key);
          cached && (cached.result = dataResult);
          refs.isMounted && forceUpdate()
        }
      }
  }))

  useEffect(() => {
    // Let subsequent renders know we are mounted (render is committed).
    refs.isMounted = true

    // In strict mode (development only), `useEffect` may run 1-2 times.
    // To avoid this, check the `timeout` to ensure cleanup only occurs after unmount.
    if (refs.cleanupTimoutId) {
      clearTimeout(refs.cleanupTimoutId)
      delete refs.cleanupTimoutId
    }

    return () => {
      refs.cleanupTimoutId = setTimeout(() => {
        if (refs.computation) {
          refs.computation.stop()
          delete refs.computation
        }
        refs.isMounted = false
        delete refs.cleanupTimoutId
      }, 0)
    }
  }, [])

  return resolveAsync(key, refs.trackerData)
}

export const useTrackerSuspenseWithDeps =
  <T = any>(key: string, reactiveFn: IReactiveFn<T>, deps: DependencyList, skipUpdate?: ISkipUpdate<T> = null): T => {
    const [version, forceUpdate] = useForceUpdate()

    const { current: refs } = useRef<{
      reactiveFn: IReactiveFn<T>
      isMounted: boolean
      trackerData?: Promise<T>
      computation?: Tracker.Computation
      cleanupTimoutId?: number
    }>({ 
      reactiveFn, 
      isMounted: false,
      trackerData: null
    })

    // keep reactiveFn ref fresh
    refs.reactiveFn = reactiveFn

    useMemo(() => {
      // To jive with the lifecycle interplay between Tracker/Subscribe, run the
      // reactive function in a computation, then stop it, to force flush cycle.
      Tracker.nonreactive(
        () => Tracker.autorun(async (comp: Tracker.Computation) => {
          if (refs.computation) {
            refs.computation.stop()
            delete refs.computation
          }

          refs.computation = comp

          const data = Tracker.withComputation(comp, async () => refs.reactiveFn(comp))

          if (comp.firstRun) {
            refs.trackerData = data
          } else {
            const dataResult = await data;

            if (!skipUpdate || !skipUpdate(await refs.trackerData, dataResult)) {
              const cached = cacheMap.get(key);
              cached && (cached.result = dataResult);
              refs.isMounted && forceUpdate()
            }
          }
        })
      )
    }, [...deps, version])

    useEffect(() => {
      // Let subsequent renders know we are mounted (render is committed).
      refs.isMounted = true

      // In strict mode (development only), `useEffect` may run 1-2 times.
      // To avoid this, check the `timeout` to ensure cleanup only occurs after unmount.
      if (refs.cleanupTimoutId) {
        clearTimeout(refs.cleanupTimoutId)
        delete refs.cleanupTimoutId
      }

      return () => {
        refs.cleanupTimoutId = setTimeout(() => {
          if (refs.computation) {
            refs.computation.stop()
            delete refs.computation
          }
          refs.isMounted = false
          delete refs.cleanupTimoutId
        }, 0)
      }
    }, deps)

    return resolveAsync(key, refs.trackerData, deps)
  }

export function useTrackerSuspenseClient<T = any>(key: string, reactiveFn: IReactiveFn<T>, skipUpdate?: ISkipUpdate<T>): T
export function useTrackerSuspenseClient<T = any>(key: string, reactiveFn: IReactiveFn<T>, deps?: DependencyList, skipUpdate?: ISkipUpdate<T>): T
export function useTrackerSuspenseClient<T = any>(key: string, reactiveFn: IReactiveFn<T>, deps: DependencyList | ISkipUpdate<T> = null, skipUpdate: ISkipUpdate<T> = null): T {
  if (deps === null || deps === undefined || !Array.isArray(deps)) {
    if (typeof deps === 'function') {
      skipUpdate = deps
    }
    return useTrackerSuspenseNoDeps(key, reactiveFn, skipUpdate)
  } else {
    return useTrackerSuspenseWithDeps(key, reactiveFn, deps, skipUpdate)
  }
}

export const useTrackerSuspenseServer: typeof useTrackerSuspenseClient = (key, reactiveFn) => {
  return resolveAsync(key, Tracker.nonreactive(reactiveFn))
}

// When rendering on the server, we don't want to use the Tracker.
// We only do the first rendering on the server so we can get the data right away
export const useTracker = Meteor.isServer
  ? useTrackerSuspenseServer
  : useTrackerSuspenseClient

function useTrackerDev(key: string, reactiveFn: any, deps: DependencyList | null = null, skipUpdate = null) {
  function warn(expects: string, pos: string, arg: string, type: string) {
    console.warn(
      `Warning: useTracker expected a ${expects} in it\'s ${pos} argument ` +
      `(${arg}), but got type of \`${type}\`.`
    )
  }

  if (typeof reactiveFn !== 'function') {
    warn('function', '1st', 'reactiveFn', reactiveFn)
  }

  if ((deps != null) && skipUpdate && !Array.isArray(deps) && typeof skipUpdate === 'function') {
    warn('array & function', '2nd and 3rd', 'deps, skipUpdate',
      `${typeof deps} & ${typeof skipUpdate}`)
  } else {
    if ((deps != null) && !Array.isArray(deps) && typeof deps !== 'function') {
      warn('array or function', '2nd', 'deps or skipUpdate', typeof deps)
    }
    if (skipUpdate && typeof skipUpdate !== 'function') {
      warn('function', '3rd', 'skipUpdate', typeof skipUpdate)
    }
  }

  const data = useTracker(key, reactiveFn, deps, skipUpdate)
  checkCursor(data)
  return data
}

export default Meteor.isDevelopment
  ? useTrackerDev
  : useTracker