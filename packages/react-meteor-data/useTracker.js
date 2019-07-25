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

function useTracker(reactiveFn, deps, computationHandler) {
  const { current: refs } = useRef({});

  const [, forceUpdate] = useReducer(fur, 0);

  const dispose = () => {
    if (refs.computationCleanup) {
      refs.computationCleanup();
      delete refs.computationCleanup;
    }
    if (refs.computation) {
      refs.computation.stop();
      refs.computation = null;
    }
  };

  useMemo(() => {
    // if we are re-creating the computation, we need to stop the old one.
    dispose();

    const tracked = (c) => {
      const runReactiveFn = () => {
        const data = reactiveFn(c);
        if (Meteor.isDevelopment) checkCursor(data);
        refs.trackerData = data;
      };

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
        // This will capture data synchronously on first run (and after deps change).
        // Additional cycles will follow the normal computation behavior.
        runReactiveFn();
      } else {
        // If deps are anything other than an array, stop computation and let next render handle reactiveFn.
        // These null and undefined checks are optimizations to avoid calling Array.isArray in these cases.
        if (deps === null || deps === undefined || !Array.isArray(deps)) {
          dispose();
        } else {
          runReactiveFn();
        }
        forceUpdate();
      }
    };

    // When rendering on the server, we don't want to use the Tracker.
    if (Meteor.isServer) {
      refs.computation = null;
      tracked(null);
    } else {
      // Use Tracker.nonreactive in case we are inside a Tracker Computation.
      // This can happen if someone calls `ReactDOM.render` inside a Computation.
      // In that case, we want to opt out of the normal behavior of nested
      // Computations, where if the outer one is invalidated or stopped,
      // it stops the inner one.
      refs.computation = Tracker.nonreactive(() => Tracker.autorun(tracked));
    }
  }, deps);

  // stop the computation on unmount
  useEffect(() => dispose, []);

  return refs.trackerData;
}

export default Meteor.isDevelopment
  ? (reactiveFn, deps, computationHandler) => {
    if (typeof reactiveFn !== 'function') {
      warn(
        `Warning: useTracker expected a function in it's first argument `
        + `(reactiveFn), but got type of ${typeof reactiveFn}.`
      );
    }
    if (deps && !Array.isArray(deps)) {
      warn(
        `Warning: useTracker expected an array in it's second argument `
        + `(dependency), but got type of ${typeof deps}.`
      );
    }
    if (computationHandler && typeof computationHandler !== 'function') {
      warn(
        `Warning: useTracker expected a function in it's third argument`
        + `(computationHandler), but got type of ${typeof computationHandler}.`
      );
    }
    return useTracker(reactiveFn, deps, computationHandler);
  }
  : useTracker;
