/* global Meteor, Package, Tracker */
import React, { useReducer, useLayoutEffect, useRef, useMemo } from 'react';

// Use React.warn() if available (should ship in React 16.9).
const warn = React.warn || console.warn.bind(console);

// Warns if data is a Mongo.Cursor or a POJO containing a Mongo.Cursor.
function checkCursor(data) {
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
    warn(
      'Warning: your reactive function is returning a Mongo cursor. '
      + 'This value will not be reactive. You probably want to call '
      + '`.fetch()` on the cursor before returning it.'
    );
  }
}

// Used to create a forceUpdate from useReducer. Forces update by
// incrementing a number whenever the dispatch method is invoked.
const fur = x => x + 1;

// The follow functions were hoisted out of the closure to reduce allocations.
// Since they no longer have access to the local vars, we pass them in and mutate here.
/* eslint-disable no-param-reassign */
const dispose = (refs) => {
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
  ? (refs, c) => {
    const data = refs.reactiveFn(c);
    checkCursor(data);
    refs.trackerData = data;
  }
  : (refs, c) => {
    refs.trackerData = refs.reactiveFn(c);
  };
/* eslint-enable no-param-reassign */

function useTracker(reactiveFn, deps, computationHandler) {
  const { current: refs } = useRef({});
  const [, forceUpdate] = useReducer(fur, 0);

  refs.reactiveFn = reactiveFn;

  // We are abusing useMemo a little bit, using it for its deps
  // compare, but not for its memoization.
  useMemo(() => {
    // if we are re-creating the computation, we need to stop the old one.
    dispose(refs);

    // Use Tracker.nonreactive in case we are inside a Tracker Computation.
    // This can happen if someone calls `ReactDOM.render` inside a Computation.
    // In that case, we want to opt out of the normal behavior of nested
    // Computations, where if the outer one is invalidated or stopped,
    // it stops the inner one.
    refs.computation = Tracker.nonreactive(() => Tracker.autorun((c) => {
      if (c === null || c.firstRun) {
        // If there is a computationHandler, pass it the computation, and store the
        // result, which may be a cleanup method.
        if (computationHandler) {
          const cleanupHandler = computationHandler(c);
          if (cleanupHandler) {
            if (Meteor.isDevelopment && typeof cleanupHandler !== 'function') {
              warn(
                'Warning: Computation handler should return a function '
                + 'to be used for cleanup or return nothing.'
              );
            }
            refs.computationCleanup = cleanupHandler;
          }
        }
        // This will capture data synchronously on first run, after deps change
        // or if deps are not an array (usually undefined).
        runReactiveFn(refs, c);
      } else {
        // These null and undefined checks are optimizations to avoid
        // calling Array.isArray in these cases.
        if (deps === null || deps === undefined || !Array.isArray(deps)) {
          // If deps are anything other than an array, stop computation and
          // let next render handle reactiveFn.
          dispose(refs);
        } else {
          // If deps is an array, run the reactiveFn now. It will not rerun
          // in the next render.
          runReactiveFn(refs, c);
        }
        forceUpdate();
      }
    }));

    // We are creating a side effect in render, which can be problematic in some cases, such as
    // Suspense or concurrent rendering or if an error is thrown and handled by an error boundary.
    // We still want synchronous rendering for a number of reasons (see readme), so we work around
    // possible memory/resource leaks by setting a timeout to automatically clean everything up,
    // and immediately cancelling it in `useLayoutEffect` if the render is committed.
    if (!refs.isCommitted) {
      refs.disposeId = setTimeout(() => {
        dispose(refs);
      }, 0);
    }
  }, deps);

  // We are using useLayoutEffect here to run synchronously with render. We can use useEffect, but
  // it substantially increases complexity, and we aren't doing anything particularly resource
  // intensive here anyway.
  useLayoutEffect(() => {
    // Now that the render is committed, we can set the flag, and cancel the timeout.
    refs.isCommitted = true;
    clearTimeout(refs.disposeId);
    delete refs.disposeId;

    // stop the computation on unmount
    return () => dispose(refs);
  }, []);

  return refs.trackerData;
}

export default Meteor.isDevelopment
  ? (reactiveFn, deps, computationHandler) => {
    if (typeof reactiveFn !== 'function') {
      warn(
        'Warning: useTracker expected a function in it\'s first argument '
        + `(reactiveFn), but got type of ${typeof reactiveFn}.`
      );
    }
    if (deps && !Array.isArray(deps)) {
      warn(
        'Warning: useTracker expected an array in it\'s second argument '
        + `(dependency), but got type of ${typeof deps}.`
      );
    }
    if (computationHandler && typeof computationHandler !== 'function') {
      warn(
        'Warning: useTracker expected a function in it\'s third argument'
        + `(computationHandler), but got type of ${typeof computationHandler}.`
      );
    }
    return useTracker(reactiveFn, deps, computationHandler);
  }
  : useTracker;
