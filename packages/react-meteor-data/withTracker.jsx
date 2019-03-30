import React, { memo } from 'react';
import useTracker from './useTracker.js';

export default function withTracker(options) {
  return Component => {
    const expandedOptions = typeof options === 'function' ? { getMeteorData: options } : options;
    const { getMeteorData, pure = true } = expandedOptions;

    // Note : until https://github.com/meteor/react-packages/pull/266 is merged (which forwards ref to the inner Component),
    // moving from a class to a function component will break existing code giving refs to withTracker-decorated components.
    function WithTracker(props) {
      const data = useTracker(() => getMeteorData(props) || {}, [props]);
      return <Component {...props} {...data} />;
    }

    return pure ? memo(WithTracker) : WithTracker;
  };
}
