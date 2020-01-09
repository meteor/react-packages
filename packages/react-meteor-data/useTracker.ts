declare var Package: any
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { useReducer, useEffect, useRef, useMemo } from 'react';

// Warns if data is a Mongo.Cursor or a POJO containing a Mongo.Cursor.
function checkCursor(data: any): void {
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

type TrackerRefs = {
  reactiveFn: Function;
  computationHandler?: Function;
  deps?: Array<any>;
  computation?: Tracker.Computation;
  isMounted: boolean;
  disposeId?: number; // TimeoutID
  trackerData: any;
  computationCleanup?: Function;
  trackerCount?: number
}

// The follow functions were hoisted out of the closure to reduce allocations.
// Since they no longer have access to the local vars, we pass them in and mutate here.
const dispose = (refs: TrackerRefs): void => {
  if (refs.computationCleanup) {
    refs.computationCleanup();
    delete refs.computationCleanup;
  }
  if (refs.computation) {
    refs.computation.stop();
    refs.computation = null;
  }
};

const runReactiveFn = Meteor.isDevelopment
  ? (refs: TrackerRefs, c: Tracker.Computation): void => {
    const data = refs.reactiveFn(c);
    checkCursor(data);
    refs.trackerData = data;
  }
  : (refs: TrackerRefs, c: Tracker.Computation): void => {
    refs.trackerData = refs.reactiveFn(c);
  };

const clear = (refs: TrackerRefs): void => {
  if (refs.disposeId) {
    clearTimeout(refs.disposeId);
    delete refs.disposeId;
  }
};

const track = (refs: TrackerRefs, forceUpdate: Function, trackedFn: Function): void => {
  // Use Tracker.nonreactive in case we are inside a Tracker Computation.
  // This can happen if someone calls `ReactDOM.render` inside a Computation.
  // In that case, we want to opt out of the normal behavior of nested
  // Computations, where if the outer one is invalidated or stopped,
  // it stops the inner one.
  Tracker.nonreactive(() => Tracker.autorun((c: Tracker.Computation) => {
    refs.computation = c;
    trackedFn(c, refs, forceUpdate);
  }));
};

const doFirstRun = (refs: TrackerRefs, c: Tracker.Computation): void => {
  // If there is a computationHandler, pass it the computation, and store the
  // result, which may be a cleanup method.
  if (refs.computationHandler) {
    const cleanupHandler = refs.computationHandler(c);
    if (cleanupHandler) {
      if (Meteor.isDevelopment && typeof cleanupHandler !== 'function') {
        console.warn(
          'Warning: Computation handler should return a function '
          + 'to be used for cleanup or return nothing.'
        );
      }
      refs.computationCleanup = cleanupHandler;
    }
  }
  // Always run the reactiveFn on firstRun
  runReactiveFn(refs, c);
}

const tracked = (c: Tracker.Computation, refs: TrackerRefs, forceUpdate: Function): void => {
  if (c.firstRun) {
    doFirstRun(refs, c);
  } else {
    if (refs.isMounted) {
      // Only run the reactiveFn if the component is mounted.
      runReactiveFn(refs, c);
      forceUpdate();
    } else {
      // If we got here, then a reactive update happened before the render was
      // committed - before useEffect has run. We don't want to run the reactiveFn
      // while we are not sure this render will be committed, so we'll dispose of the
      // computation, and set everything up to be restarted in useEffect if needed.
      // NOTE: If we don't run the user's reactiveFn when a computation updates, we'll
      // leave the computation in a non-reactive state - so we need to dispose here
      // and let useEffect recreate the computation later.
      dispose(refs);
      // Might as well clear the timeout!
      clear(refs);
    }
  }
};

function useTrackerNoDeps (reactiveFn: Function, deps?: null | Array<any>, computationHandler?: Function): any {
  const { current: refs } = useRef<TrackerRefs>({
    reactiveFn,
    isMounted: false,
    trackerData: null
  });
  const [, forceUpdate] = useReducer(fur, 0);

  refs.reactiveFn = reactiveFn;
  if (computationHandler) {
    refs.computationHandler = computationHandler;
  }

  dispose(refs);
  track(refs, forceUpdate, (c: Tracker.Computation) => {
    if (c.firstRun) {
      doFirstRun(refs, c);
    } else {
      // For any reactive change, forceUpdate and let the next render rebuild the computation.
      forceUpdate();
    }
  });

  // The strategy to work around creating side effects in render with Tracker when not using deps
  // is to create the computation, run the user's reactive function in a computation synchronously,
  // and immediately dispose of it. It'll be recreated again after the render is committed.
  if (!refs.isMounted) {
    // We want to forceUpdate in useEffect to support StrictMode.
    // See: https://github.com/meteor/react-packages/issues/278
    dispose(refs);
  }

  useEffect(() => {
    // Now that we are mounted, we can set the flag, and cancel the timeout
    refs.isMounted = true;

    // Render is committed. Since useTracker without deps always runs synchronously,
    // forceUpdate and let the next render recreate the computation.
    forceUpdate();

    // stop the computation on unmount
    return () => dispose(refs);
  }, []);

  return refs.trackerData;
}

function useTrackerWithDeps (reactiveFn: Function, deps: Array<any>, computationHandler?: Function): any {
  const { current: refs } = useRef<TrackerRefs>({
    reactiveFn,
    isMounted: false,
    trackerData: null
  });
  const [, forceUpdate] = useReducer(fur, 0);

  // Always have up to date deps and computations in all contexts
  refs.reactiveFn = reactiveFn;
  refs.deps = deps;
  if (computationHandler) {
    refs.computationHandler = computationHandler;
  }

  // We are abusing useMemo a little bit, using it for it's deps
  // compare, but not for it's memoization.
  useMemo(() => {
    // if we are re-creating the computation, we need to stop the old one.
    dispose(refs);

    track(refs, forceUpdate, tracked)

    // Tracker creates side effect in render, which can be problematic in some cases, such as
    // Suspense or concurrent rendering or if an error is thrown and handled by an error boundary.
    // We still want synchronous rendering for a number of reasons (see readme). useTracker works
    // around memory/resource leaks by setting a time out to automatically clean everything up,
    // and watching a set of references to make sure everything is choreographed correctly.
    if (!refs.isMounted) {
      // Components yield to allow the DOM to update and the browser to paint before useEffect
      // is run. In concurrent mode this can take quite a long time. 1000ms should be enough
      // in most cases.
      refs.disposeId = setTimeout(() => {
        if (!refs.isMounted) {
          dispose(refs);
        }
      }, 1000);
    }
  }, deps);

  useEffect(() => {
    refs.isMounted = true;

    // Render is committed, clear the dispose timeout
    clear(refs);

    // If it took longer than 1000ms to get to useEffect, or a reactive update happened
    // before useEffect, restart the computation and forceUpdate.
    if (!refs.computation) {
      // This also runs runReactiveFn
      track(refs, forceUpdate, tracked);
      forceUpdate();
    }

    // stop the computation on unmount
    return () => dispose(refs);
  }, []);

  return refs.trackerData;
}

function useTrackerClient (reactiveFn: Function, deps?: Array<any> | null, computationHandler?: Function): any {
  if (deps === null || deps === undefined || !Array.isArray(deps)) {
    return useTrackerNoDeps(reactiveFn, deps, computationHandler);
  } else {
    return useTrackerWithDeps(reactiveFn, deps, computationHandler);
  }
}

const useTrackerServer = (reactiveFn: Function, deps?: Array<any> | null, computationHandler?: Function): any =>
  Tracker.nonreactive(reactiveFn);

// When rendering on the server, we don't want to use the Tracker.
// We only do the first rendering on the server so we can get the data right away
const useTracker = Meteor.isServer
  ? useTrackerServer
  : useTrackerClient;

export default Meteor.isDevelopment
  ? (reactiveFn: Function, deps?: Array<any> | null, computationHandler?: Function): any => {
    if (typeof reactiveFn !== 'function') {
      console.warn(
        'Warning: useTracker expected a function in it\'s first argument '
        + `(reactiveFn), but got type of ${typeof reactiveFn}.`
      );
    }
    if (deps && !Array.isArray(deps)) {
      console.warn(
        'Warning: useTracker expected an array in it\'s second argument '
        + `(dependency), but got type of ${typeof deps}.`
      );
    }
    if (computationHandler && typeof computationHandler !== 'function') {
      console.warn(
        'Warning: useTracker expected a function in it\'s third argument'
        + `(computationHandler), but got type of ${typeof computationHandler}.`
      );
    }
    return useTracker(reactiveFn, deps, computationHandler);
  }
  : useTracker;
