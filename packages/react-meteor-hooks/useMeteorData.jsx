import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { useEffect, useState } from 'react';

let useMeteorData;

if (Meteor.isServer) {
  // When rendering on the server, we don't want to use the Tracker.
  // We only do the first rendering on the server so we can get the data right away
  useMeteorData = getMeteorData => getMeteorData();
} else {
  useMeteorData = (getMeteorData, inputs = []) => {
    const [meteorData, setMeteorData] = useState(getMeteorData());
    let computation;

    const cleanUp = () => {
      computation.stop();
      computation = null;
    }

    useEffect(() => {
      if(computation) cleanUp();

      Tracker.autorun((currentComputation) => {
        computation = currentComputation;
        setMeteorData(getMeteorData());
      });

      return cleanUp;
    }, inputs);

    return meteorData;
  }
}
export default useMeteorData;
