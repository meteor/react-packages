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

function useTracker(reactiveFn, deps) {
  const { current: refs } = useRef({ memoCounter: 0 });

  const [, forceUpdate] = useReducer(fur, 0);

  const dispose = () => {
    if (refs.computation) {
      refs.computation.stop();
      refs.computation = null;
    }
  };

  // useMemo is used only to leverage React's core deps compare algorithm. useMemo
  // runs synchronously with render, so we can think of it being called like
  // componentWillMount or componentWillUpdate. One case we have to work around is
  // if deps are falsy. In that case, we need to increment a value for every render
  // since this should always run when deps are falsy.
  const memoDeps = (deps !== null && deps !== undefined && !Array.isArray(deps))
    ? [++refs.memoCounter]
    : deps;

  useMemo(() => {
    // if we are re-creating the computation, we need to stop the old one.
    dispose();

    // Use Tracker.nonreactive in case we are inside a Tracker Computation.
    // This can happen if someone calls `ReactDOM.render` inside a Computation.
    // In that case, we want to opt out of the normal behavior of nested
    // Computations, where if the outer one is invalidated or stopped,
    // it stops the inner one.
    refs.computation = Tracker.nonreactive(() => (
      Tracker.autorun((c) => {
        const runReactiveFn = () => {
          const data = reactiveFn(c);
          if (Meteor.isDevelopment) checkCursor(data);
          refs.trackerData = data;
        };

        if (c.firstRun) {
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
      })
    ));
  }, memoDeps);

  // stop the computation on unmount only
  useEffect(() => {
    // falsy deps is okay, but if deps is not falsy, it must be an array
    if (Meteor.isDevelopment && (deps && !Array.isArray(deps))) {
      warn(
        'Warning: useTracker expected an initial dependency value of '
        + `type array, null or undefined but got type of ${typeof deps} instead.`
      );
    }

    return dispose;
  }, []);

  return refs.trackerData;
}

// When rendering on the server, we don't want to use the Tracker.
// We only do the first rendering on the server so we can get the data right away
function useTrackerServer(reactiveFn) {
  return reactiveFn();
}

export default (Meteor.isServer ? useTrackerServer : useTracker);
