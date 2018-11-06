import { useState, useEffect, useRef } from 'react';
import { Tracker } from 'meteor/tracker';
import { Meteor } from 'meteor/meteor';

let useTracker;

if (Meteor.isServer) {
  // When rendering on the server, we don't want to use the Tracker.
  // We only do the first rendering on the server so we can get the data right away
  useTracker = reactiveFn => reactiveFn();
}
else {
  // @todo specify a default value for dependencies ? omitting them can be very bad perf-wise
  useTracker = (reactiveFn, dependencies) => {
    const computation = useRef();

    // We setup the computation at mount time so that we can return the first results,
    // but need to defer subscriptions until didMount in useEffect below.
    const deferredSubscriptions = useRef([]);
    let realSubscribe = Meteor.subscribe;
    Meteor.subscribe = (name, ...args) => {
      deferredSubscriptions.current.push([name, ...args]);
      return { stop: () => {}, isReady: () => false };
    };

    // Also, the lazy initialization callback we provide to useState cannot use
    // the setState callback useState will give us. We provide a no-op stub for the first run.
    let setState = () => {};

    // The first run at mount time will use the stubbed Meteor.subscribe and setState above.
    const setUpComputation = () => {
      // console.log('setup');
      let data;
      // Use Tracker.nonreactive in case we are inside a Tracker Computation.
      // This can happen if someone calls `ReactDOM.render` inside a Computation.
      // In that case, we want to opt out of the normal behavior of nested
      // Computations, where if the outer one is invalidated or stopped,
      // it stops the inner one.
      Tracker.nonreactive(() => {
        computation.current = Tracker.autorun(() => {
          // console.log('run');
          data = reactiveFn();
          if (Package.mongo && Package.mongo.Mongo && data instanceof Package.mongo.Mongo.Cursor) {
            console.warn(
              'Warning: you are returning a Mongo cursor from useEffect. '
              + 'This value will not be reactive. You probably want to call '
              + '`.fetch()` on the cursor before returning it.'
            );
          }
          setState(data);
        });
      });
      return data;
    };

    // Set initial state and generate the setter.
    const [state, doSetState] = useState(() => setUpComputation());

    // Replace the stubs with the actual implementations for the subsequent re-runs.
    setState = doSetState;
    Meteor.subscribe = realSubscribe;

    useEffect(() => {
      // If we collected deferred subscriptions at mount time, we run them.
      if (computation.current && deferredSubscriptions.current) {
        // console.log('setup deferred subscriptions');
        deferredSubscriptions.current.forEach(([name, ...args]) => {
          const { stop } = Meteor.subscribe(name, ...args);
          computation.current.onStop(stop);
        });
        deferredSubscriptions.current = null;
      }
      // If the computation was stopped during cleanup, we create the new one.
      if (!computation.current) {
        setUpComputation();
      }
      // On cleanup, stop the current computation.
      return () => {
        if (computation.current) {
          // console.log('cleanup');
          computation.current.stop();
          computation.current = null;
        }
      };
    }, dependencies);

    return state;
  };
}

export default useTracker;
