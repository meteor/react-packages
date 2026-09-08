declare var Package: any
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { useReducer, useEffect, useRef, useMemo, DependencyList } from 'react';
import useSyncEffect from './useSyncEffect'

// Warns if data is a Mongo.Cursor or a POJO containing a Mongo.Cursor.
function checkCursor (data: any): void {
  let shouldWarn = false;
  if (Package.mongo && Package.mongo.Mongo && data && typeof data === 'object') {
    if (data instanceof Package.mongo.Mongo.Cursor) {
      shouldWarn = true;
    } else if (Object.getPrototypeOf(data) === Object.prototype) {
      Object.keys(data).forEach((key) => {
        if (data[key] instanceof Package.mongo.Mongo.Cursor) {
          shouldWarn = true;
        }
      });
    }
  }
  if (shouldWarn) {
    console.warn(
      'Warning: your reactive function is returning a Mongo cursor. '
      + 'This value will not be reactive. You probably want to call '
      + '`.fetch()` on the cursor before returning it.'
    );
  }
}

// Used to create a forceUpdate from useReducer. Forces update by
// incrementing a number whenever the dispatch method is invoked.
const fur = (x: number): number => x + 1;
const useForceUpdate = () => useReducer(fur, 0)[1];

export interface IReactiveFn<T> {
  (c?: Tracker.Computation): T
}

export interface ISkipUpdate<T> {
  <T>(prev: T, next: T): boolean
}

type TrackerRefs = {
  computation?: Tracker.Computation;
  isMounted: boolean;
  trackerData: any;
}

const useTrackerWithDeps = <T = any>(reactiveFn: IReactiveFn<T>, deps: DependencyList, skipUpdate: ISkipUpdate<T> = null): T => {
  const forceUpdate = useForceUpdate();

  const { current: refs } = useRef<{
    trackerData?: T;
    skipUpdate?: ISkipUpdate<T>;
  }>({ reactiveFn, skipUpdate });

  refs.skipUpdate = skipUpdate;
  refs.reactiveFn = reactiveFn;

  useSyncEffect(() => {
    const computation = Tracker.nonreactive(() => Tracker.autorun((computation: Tracker.Computation) => {
      const data = refs.reactiveFn(computation);
      // console.log('reactiveFn()', data);

      if (computation.firstRun) {
        refs.trackerData = data;
      } else if (!refs.skipUpdate || !refs.skipUpdate(refs.trackerData, data)) {
        refs.trackerData = data;
        forceUpdate();
      }
    }));

    return () => {
      computation.stop();
    };
  }, deps);

  return refs.trackerData as T;
};

const useTrackerNoDeps = <T = any>(reactiveFn: IReactiveFn<T>, skipUpdate: ISkipUpdate<T> = null) => (
  useTrackerWithDeps(reactiveFn, undefined, skipUpdate)
)

function useTrackerClient <T = any>(reactiveFn: IReactiveFn<T>, skipUpdate?: ISkipUpdate<T>): T;
function useTrackerClient <T = any>(reactiveFn: IReactiveFn<T>, deps?: DependencyList, skipUpdate?: ISkipUpdate<T>): T;
function useTrackerClient <T = any>(reactiveFn: IReactiveFn<T>, deps: DependencyList | ISkipUpdate<T> = null, skipUpdate: ISkipUpdate<T> = null): T {
  if (deps === null || deps === undefined || !Array.isArray(deps)) {
    if (typeof deps === "function") {
      skipUpdate = deps;
    }
    return useTrackerNoDeps(reactiveFn, skipUpdate);
  } else {
    return useTrackerWithDeps(reactiveFn, deps, skipUpdate);
  }
}

const useTrackerServer: typeof useTrackerClient = (reactiveFn) => {
  return Tracker.nonreactive(reactiveFn);
}

// When rendering on the server, we don't want to use the Tracker.
// We only do the first rendering on the server so we can get the data right away
const _useTracker = Meteor.isServer
  ? useTrackerServer
  : useTrackerClient;

function useTrackerDev (reactiveFn, deps = null, skipUpdate = null) {
  function warn (expects: string, pos: string, arg: string, type: string) {
    console.warn(
      `Warning: useTracker expected a ${expects} in it\'s ${pos} argument `
        + `(${arg}), but got type of \`${type}\`.`
    );
  }

  if (typeof reactiveFn !== 'function') {
    warn("function", "1st", "reactiveFn", reactiveFn);
  }

  if (deps && skipUpdate && !Array.isArray(deps) && typeof skipUpdate === "function") {
    warn("array & function", "2nd and 3rd", "deps, skipUpdate",
      `${typeof deps} & ${typeof skipUpdate}`);
  } else {
    if (deps && !Array.isArray(deps) && typeof deps !== "function") {
      warn("array or function", "2nd", "deps or skipUpdate", typeof deps);
    }
    if (skipUpdate && typeof skipUpdate !== "function") {
      warn("function", "3rd", "skipUpdate", typeof skipUpdate);
    }
  }

  const data = _useTracker(reactiveFn, deps, skipUpdate);
  checkCursor(data);
  return data;
}

export const useTracker = Meteor.isDevelopment
  ? useTrackerDev as typeof useTrackerClient
  : _useTracker;
