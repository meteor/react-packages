/* global Meteor, Package, Tracker */
import React, { useReducer, useEffect, useRef, useMemo } from 'react';

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
const clear = (refs) => {
  if (refs.disposeId) {
    clearTimeout(refs.disposeId);
    delete refs.disposeId;
  }
};
/* eslint-enable no-param-reassign */

function useTrackerClient(reactiveFn, deps, computationHandler) {
  const { current: refs } = useRef({});

  const [, forceUpdate] = useReducer(fur, 0);

  refs.reactiveFn = reactiveFn;

  const tracked = (c) => {
    if (c.firstRun) {
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
      // Always run the reactiveFn on firstRun
      runReactiveFn(refs, c);
    } else {
      // If deps are anything other than an array, stop computation and let next render
      // handle reactiveFn. These null and undefined checks are optimizations to avoid
      // calling Array.isArray in these cases.
      if (deps === null || deps === undefined || !Array.isArray(deps)) {
        dispose(refs);
        forceUpdate();
      } else if (refs.isMounted) {
        // Only run the reactiveFn if the component is mounted.
        runReactiveFn(refs, c);
        forceUpdate();
      } else {
        // If we got here, then a reactive update happened before the render was
        // committed - before useEffect has run. We don't want to run the reactiveFn
        // while we are not sure this render will be committed, so we'll dispose of the
        // computation, and set everything up to be restarted in useEffect if needed.
        // NOTE: If we don't run the user's reactiveFn when a computation updates, we'll
        // leave the computation in a non-reactive state - so we'll dispose here and let
        // the useEffect hook recreate the computation later.
        dispose(refs);
        // Might as well clear the timeout!
        clear(refs);
      }
    }
  };

  // We are abusing useMemo a little bit, using it for it's deps
  // compare, but not for it's memoization.
  useMemo(() => {
    // if we are re-creating the computation, we need to stop the old one.
    dispose(refs);

    // Use Tracker.nonreactive in case we are inside a Tracker Computation.
    // This can happen if someone calls `ReactDOM.render` inside a Computation.
    // In that case, we want to opt out of the normal behavior of nested
    // Computations, where if the outer one is invalidated or stopped,
    // it stops the inner one.
    refs.computation = Tracker.nonreactive(() => Tracker.autorun(tracked));

    // We are creating a side effect in render, which can be problematic in some cases, such as
    // Suspense or concurrent rendering or if an error is thrown and handled by an error boundary.
    // We still want synchronous rendering for a number of reason (see readme), so we work around
    // possible memory/resource leaks by setting a time out to automatically clean everything up,
    // and watching a set of references to make sure everything is choreographed correctly.
    if (!refs.isMounted) {
      // Components yield to allow the DOM to update and the browser to paint before useEffect
      // is run. In concurrent mode this can take quite a long time, so we set a 1000ms timeout
      // to allow for that.
      refs.disposeId = setTimeout(() => {
        if (!refs.isMounted) {
          dispose(refs);
        }
      }, 1000);
    }
  }, deps);

  useEffect(() => {
    // Now that we are mounted, we can set the flag, and cancel the timeout
    refs.isMounted = true;

    // We are committed, clear the dispose timeout
    clear(refs);

    // If it took longer than 1000ms to get to useEffect, or a reactive update happened
    // before useEffect, we will need to forceUpdate, and restart the computation.
    if (!refs.computation) {
      // If we have deps, we need to set up a new computation before forcing update.
      // If we have NO deps, it'll be recreated and rerun on the next render.
      if (Array.isArray(deps)) {
        // This also runs runReactiveFn
        refs.computation = Tracker.nonreactive(() => Tracker.autorun(tracked));
      }
      forceUpdate();
    }

    // stop the computation on unmount
    return () => dispose(refs);
  }, []);

  return refs.trackerData;
}

// When rendering on the server, we don't want to use the Tracker.
// We only do the first rendering on the server so we can get the data right away
const useTracker = Meteor.isServer
  ? (reactiveFn) => reactiveFn()
  : useTrackerClient;

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
