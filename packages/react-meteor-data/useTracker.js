import { useState, useEffect, useCallback } from 'react';
import { Tracker } from 'meteor/tracker';
import { Meteor } from 'meteor/meteor';

let useTracker;

if (Meteor.isServer) {
  // When rendering on the server, we don't want to use the Tracker.
  // We only do the first rendering on the server so we can get the data right away
  useTracker = reactiveFn => reactiveFn();
}
else {
  useTracker = (reactiveFn, dependencies) => {
    const [trackerData, setTrackerData] = useState(null);
    const callback = useCallback(reactiveFn, dependencies);

    useEffect(() => {
      let computation;
      // Use Tracker.nonreactive in case we are inside a Tracker Computation.
      // This can happen if someone calls `ReactDOM.render` inside a Computation.
      // In that case, we want to opt out of the normal behavior of nested
      // Computations, where if the outer one is invalidated or stopped,
      // it stops the inner one.
      Tracker.nonreactive(() => {
        computation = Tracker.autorun(() => {
          const data = callback();
          if (Package.mongo && Package.mongo.Mongo && data instanceof Package.mongo.Mongo.Cursor) {
            console.warn(
              'Warning: you are returning a Mongo cursor from useEffect. '
              + 'This value will not be reactive. You probably want to call '
              + '`.fetch()` on the cursor before returning it.'
            );
          }
          setTrackerData(data);
        });
      });
      return () => computation.stop();
    }, [callback]);

    return trackerData;
  };
}

export default useTracker;
