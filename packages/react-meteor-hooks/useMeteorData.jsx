import { Tracker } from 'meteor/tracker';
import { useEffect, useState } from 'react';

export default function (getMeteorData, inputs = []) {
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
