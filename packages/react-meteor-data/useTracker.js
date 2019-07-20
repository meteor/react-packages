/* global Meteor, Package, Tracker */
import React, { useState, useEffect, useRef } from 'react';

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

// taken from https://github.com/facebook/react/blob/
// 34ce57ae751e0952fd12ab532a3e5694445897ea/packages/shared/objectIs.js
function is(x, y) {
  return (
    (x === y && (x !== 0 || 1 / x === 1 / y))
    || (x !== x && y !== y) // eslint-disable-line no-self-compare
  );
}

// inspired by https://github.com/facebook/react/blob/
// 34ce57ae751e0952fd12ab532a3e5694445897ea/packages/
// react-reconciler/src/ReactFiberHooks.js#L307-L354
// used to replicate dep change behavior and stay consistent
// with React.useEffect()
function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null || prevDeps === undefined || !Array.isArray(prevDeps)) {
    return false;
  }

  if (!Array.isArray(nextDeps)) {
    if (Meteor.isDevelopment) {
      warn(
        'Warning: useTracker expected an dependency value of '
        + `type array but got type of ${typeof nextDeps} instead.`
      );
    }
    return false;
  }

  const len = nextDeps.length;

  if (prevDeps.length !== len) {
    return false;
  }

  for (let i = 0; i < len; i++) {
    if (!is(nextDeps[i], prevDeps[i])) {
      return false;
    }
  }

  return true;
}

function useTracker(reactiveFn, deps, computationHandler) {
  if (Meteor.isDevelopment) {
    if (typeof reactiveFn !== 'function') {
      warn(
        `Warning: useTracker expected a function in it's first argument `
        + `(reactiveFn), but got type of ${typeof reactiveFn}.`
      )
    }
    if (deps && !Array.isArray(deps)) {
      warn(
        `Warning: useTracker expected an array in it's second argument `
        + `(dependency), but got type of ${typeof deps}.`
      );
    }
    if (typeof computationHandler !== 'function') {
      warn(
        `Warning: useTracker expected a function in it's third argument`
        + `(computationHandler), but got type of ${typeof computationHandler}.`
      );
    }
  }

  const { current: refs } = useRef({});

  const [counter, forceUpdate] = useState(0);

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

  // this is called like at componentWillMount and componentWillUpdate equally
  // in order to support render calls with synchronous data from the reactive computation
  // if prevDeps or deps are not set areHookInputsEqual always returns false
  // and the reactive functions is always called
  if (!areHookInputsEqual(deps, refs.previousDeps)) {
    // if we are re-creating the computation, we need to stop the old one.
    dispose();

    // store the deps for comparison on next render
    refs.previousDeps = deps;

    const tracked = (c) => {
      const runReactiveFn = () => {
        const data = reactiveFn();
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
                + 'to be used for cleanup or nothing.'
              );
            }
            refs.computationCleanup = cleanupHandler;
          }
        }
        // This will capture data synchronously on first run (and after deps change).
        // Additional cycles will follow the normal computation behavior.
        runReactiveFn();
      } else {
        // If deps are falsy, stop computation and let next render handle reactiveFn.
        if (!refs.previousDeps) {
          dispose();
        } else {
          runReactiveFn();
        }
        // use a uniqueCounter to trigger a state change to force a re-render
        forceUpdate(counter + 1);
      }
    }

    // When rendering on the server, we don't want to use the Tracker.
    if (Meteor.isServer) {
      refs.computation = tracked(null);
    } else {
      // Use Tracker.nonreactive in case we are inside a Tracker Computation.
      // This can happen if someone calls `ReactDOM.render` inside a Computation.
      // In that case, we want to opt out of the normal behavior of nested
      // Computations, where if the outer one is invalidated or stopped,
      // it stops the inner one.
      refs.computation = Tracker.nonreactive(() => Tracker.autorun(tracked));
    }
  }

  // stop the computation on unmount
  useEffect(() => dispose, []);

  return refs.trackerData;
}

export default useTracker;
