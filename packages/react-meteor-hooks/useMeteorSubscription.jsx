import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { useEffect, useState } from 'react';

let useMeteorSubscription;

if (Meteor.isServer) {
  // When rendering on the server, we don't want to use the Tracker.
  // The subscription is always ready on the server.
  useMeteorSubscription = () => true;
} else {
  useMeteorSubscription = (publication, ...parameters) => {
    const [loading, setLoading] = useState(true);
    let handle, computation;

    const cleanUp = () => {
      handle && handle.stop();
      handle = null;
      computation && computation.stop();
      computation = null;
    }

    useEffect(() => {
      if(computation) cleanUp();

      Tracker.autorun((currentComputation) => {
        computation = currentComputation;

        handle = Meteor.subscribe(publication, ...parameters);
        setLoading(!handle.ready());
      });

      return cleanUp;
    }, [publication, ...parameters]);

    return loading;
  }
}

export default useMeteorSubscription;
