import { Tracker } from 'meteor/tracker'
import { EJSON } from 'meteor/ejson'
import { DependencyList, useEffect, useMemo, useReducer, useRef } from 'react'
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

export const cache = new Map<string, Cache>()

interface Cache {
  deps: EJSON[]
  promise: Promise<unknown>
  result?: unknown
  error?: unknown
}

// Used to create a forceUpdate from useReducer. Forces update by
// incrementing a number whenever the dispatch method is invoked.
const fur = (x: number): number => x + 1
const useForceUpdate = () => useReducer(fur, 0)[1]

export type IReactiveFn<T> = (c?: Tracker.Computation) => Promise<T>

export type ISkipUpdate<T> = <T>(prev: T, next: T) => boolean

interface TrackerRefs {
  computation?: Tracker.Computation
  isMounted: boolean
  trackerData: any
}

function resolveAsync(key: string, promise: Promise<unknown>, deps: DependencyList = []) {
  const cached = cache.get(key) ?? false
  useEffect(() => {
    return () => {
      setTimeout(() => {
        // maybe verify deps?
        if (cached) cache.delete(key)
      }, 0)
    }
  }, [cached, key, ...deps])
  if (promise === null) return null
  if (cached) {
    if ('error' in cached) throw cached.error
    if ('result' in cached) return cached.result
    throw cached.promise
  }

  const entry: Cache = {
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
        .finally(() => {
          // if 0 recursion :/
          // also forcing an update thigs when out of hand
          setTimeout(() => {
            cache.delete(key)
          }, 10)
        })
    })
  }
  cache.set(key, entry)
  throw entry.promise
}

export function useTrackerNoDeps<T = any>(key: string, reactiveFn: IReactiveFn<T>, skipUpdate: ISkipUpdate<T> = null): T {
  const { current: refs } = useRef<TrackerRefs>({
    isMounted: false,
    trackerData: null
  })
  const forceUpdate = useForceUpdate()

  // Without deps, always dispose and recreate the computation with every render.
  if (refs.computation != null) {
    refs.computation.stop()
    // @ts-expect-error This makes TS think ref.computation is "never" set
    delete refs.computation
  }

  // Use Tracker.nonreactive in case we are inside a Tracker Computation.
  // This can happen if someone calls `ReactDOM.render` inside a Computation.
  // In that case, we want to opt out of the normal behavior of nested
  // Computations, where if the outer one is invalidated or stopped,
  // it stops the inner one.
  Tracker.nonreactive(() =>
    Tracker.autorun((c: Tracker.Computation) => {
      refs.computation = c

      const data: Promise<any> = Tracker.withComputation(c, async () => reactiveFn(c))
      if (c.firstRun) {
        // Always run the reactiveFn on firstRun
        refs.trackerData = data
        /// TODO : this about this case
      } else if (!skipUpdate || !skipUpdate(refs.trackerData, data)) {
        // For any reactive change, forceUpdate and let the next render rebuild the computation.
        forceUpdate()
      }
    }))

  // To clean up side effects in render, stop the computation immediately
  if (!refs.isMounted) {
    Meteor.defer(() => {
      if (!refs.isMounted && (refs.computation != null)) {
        refs.computation.stop()
        delete refs.computation
      }
    })
  }

  useEffect(() => {
    // Let subsequent renders know we are mounted (render is committed).
    refs.isMounted = true

    // In some cases, the useEffect hook will run before Meteor.defer, such as
    // when React.lazy is used. In those cases, we might as well leave the
    // computation alone!
    if (refs.computation == null) {
      // Render is committed, but we no longer have a computation. Invoke
      // forceUpdate and let the next render recreate the computation.
      if (!skipUpdate) {
        forceUpdate()
      } else {
        Tracker.nonreactive(() =>
          Tracker.autorun((c: Tracker.Computation) => {
            const data = Tracker.withComputation(c, async () => await reactiveFn(c))

            refs.computation = c
            // TODO: this about this case how to deal with tracker data and data being async
            if (!skipUpdate(refs.trackerData, data)) {
              // For any reactive change, forceUpdate and let the next render rebuild the computation.
              forceUpdate()
            }
          }))
      }
    }

    // stop the computation on unmount
    return () => {
      refs.computation?.stop()
      delete refs.computation
      refs.isMounted = false
    }
  }, [])

  return resolveAsync(key, refs.trackerData) as T
}

export const useTrackerWithDeps =
  <T = any>(key: string, reactiveFn: IReactiveFn<T>, deps: DependencyList, skipUpdate: ISkipUpdate<T> = null): T => {
    const forceUpdate = useForceUpdate()

    const { current: refs } = useRef<{
      reactiveFn: IReactiveFn<T>
      data?: Promise<T>
      comp?: Tracker.Computation
      isMounted?: boolean
    }>({ reactiveFn })

    // keep reactiveFn ref fresh
    refs.reactiveFn = reactiveFn

    useMemo(() => {
      // To jive with the lifecycle interplay between Tracker/Subscribe, run the
      // reactive function in a computation, then stop it, to force flush cycle.
      const comp = Tracker.nonreactive(
        () => Tracker.autorun((c: Tracker.Computation) => {
          const data = Tracker.withComputation(c, async () => await refs.reactiveFn())
          if (c.firstRun) {
            refs.data = data
          } else if (!skipUpdate || !skipUpdate(refs.data, data)) {
            refs.data = data
            forceUpdate()
          }
        })
      )

      // Stop the computation immediately to avoid creating side effects in render.
      // refers to this issues:
      // https://github.com/meteor/react-packages/issues/382
      // https://github.com/meteor/react-packages/issues/381
      if (refs.comp != null) refs.comp.stop()

      // In some cases, the useEffect hook will run before Meteor.defer, such as
      // when React.lazy is used. This will allow it to be stopped earlier in
      // useEffect if needed.
      refs.comp = comp
      // To avoid creating side effects in render, stop the computation immediately
      Meteor.defer(() => {
        if (!refs.isMounted && (refs.comp != null)) {
          refs.comp.stop()
          delete refs.comp
        }
      })
    }, deps)

    useEffect(() => {
      // Let subsequent renders know we are mounted (render is committed).
      refs.isMounted = true

      if (refs.comp == null) {
        refs.comp = Tracker.nonreactive(
          () => Tracker.autorun((c) => {
            const data: Promise<T> = Tracker.withComputation(c, async () => await refs.reactiveFn())
            if (!skipUpdate || !skipUpdate(refs.data, data)) {
              refs.data = data
              forceUpdate()
            }
          })
        )
      }

      return () => {
        // @ts-expect-error
        refs.comp.stop()
        delete refs.comp
        refs.isMounted = false
      }
    }, deps)

    return resolveAsync(key, refs.data as Promise<T>, deps) as T
  }

function useTrackerClient<T = any> (key: string, reactiveFn: IReactiveFn<T>, skipUpdate?: ISkipUpdate<T>): T
function useTrackerClient<T = any> (key: string, reactiveFn: IReactiveFn<T>, deps?: DependencyList, skipUpdate?: ISkipUpdate<T>): T
function useTrackerClient<T = any>(key: string, reactiveFn: IReactiveFn<T>, deps: DependencyList | ISkipUpdate<T> = null, skipUpdate: ISkipUpdate<T> = null): T {
  if (deps === null || deps === undefined || !Array.isArray(deps)) {
    if (typeof deps === 'function') {
      skipUpdate = deps
    }
    return useTrackerNoDeps(key, reactiveFn, skipUpdate)
  } else {
    return useTrackerWithDeps(key, reactiveFn, deps, skipUpdate)
  }
}

const useTrackerServer: typeof useTrackerClient = (key, reactiveFn) => {
  return resolveAsync(key, Tracker.nonreactive(reactiveFn))
}

// When rendering on the server, we don't want to use the Tracker.
// We only do the first rendering on the server so we can get the data right away
const _useTracker = Meteor.isServer
  ? useTrackerServer
  : useTrackerClient

function useTrackerDev(key: string, reactiveFn, deps: DependencyList | null = null, skipUpdate = null) {
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

  const data = _useTracker(key, reactiveFn, deps, skipUpdate)
  checkCursor(data)
  return data
}

export const useTracker = Meteor.isDevelopment
  ? useTrackerDev as typeof useTrackerClient
  : _useTracker
