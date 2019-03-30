import React, { useState, useEffect } from 'react';
import { Tracker } from 'meteor/tracker';
import { Meteor } from 'meteor/meteor';

// Warns if data is a Mongo.Cursor or a POJO containing a Mongo.Cursor.
function checkCursor(data) {
  let shouldWarn = false;
  if (Package.mongo && Package.mongo.Mongo && typeof data === 'object') {
    if (data instanceof Package.mongo.Mongo.Cursor) {
      shouldWarn = true;
    }
    else if (Object.getPrototypeOf(data) === Object.prototype) {
      Object.keys(data).forEach((key) => {
        if (data[key] instanceof Package.mongo.Mongo.Cursor) {
          shouldWarn = true;
        }
      });
    }
  }
  if (shouldWarn) {
    // Use React.warn() if available (should ship in React 16.9).
    const warn = React.warn || console.warn.bind(console);
    warn(
      'Warning: your reactive function is returning a Mongo cursor. '
      + 'This value will not be reactive. You probably want to call '
      + '`.fetch()` on the cursor before returning it.'
    );
  }
}

let useTracker;
if (Meteor.isServer) {
  // When rendering on the server, we don't want to use the Tracker.
  // We only do the first rendering on the server so we can get the data right away
  useTracker = reactiveFn => reactiveFn();
}
else {
  // @todo specify a default value for dependencies ? Omitting them can be very bad perf-wise.
  useTracker = (reactiveFn, dependencies) => {
    // Run the function once on mount without autorun or subscriptions,
    // to get the initial return value.
    // Note: maybe when React Suspense is officially available we could
    // throw a Promise instead to skip the 1st render altogether ?
    const [trackerData, setTrackerData] = useState(() => {
      // We need to prevent subscriptions from running in that initial run.
      const realSubscribe = Meteor.subscribe;
      Meteor.subscribe = () => ({ stop: () => {}, ready: () => false });
      const initialData = Tracker.nonreactive(reactiveFn);
      Meteor.subscribe = realSubscribe;
      return initialData;
    });

    useEffect(() => {
      let computation;
      // Use Tracker.nonreactive in case we are inside a Tracker Computation.
      // This can happen if someone calls `ReactDOM.render` inside a Computation.
      // In that case, we want to opt out of the normal behavior of nested
      // Computations, where if the outer one is invalidated or stopped,
      // it stops the inner one.
      Tracker.nonreactive(() => {
        computation = Tracker.autorun(() => {
          const data = reactiveFn();
          checkCursor(data);
          setTrackerData(data);
        });
      });
      return () => computation.stop();
    }, dependencies);

    return trackerData;
  };
}

export default useTracker;
