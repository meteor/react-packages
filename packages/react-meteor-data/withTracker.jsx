import React, { memo } from 'react';
import useTracker from './useTracker.js';

export default function withTracker(options) {
  return Component => {
    const expandedOptions = typeof options === 'function' ? { getMeteorData: options } : options;
    const { getMeteorData, pure = true } = expandedOptions;

    function WithTracker(props) {
      const data = useTracker(() => getMeteorData(props) || {}, [props]);
      return <Component {...props} {...data} />;
    }

    return pure ? memo(WithTracker) : WithTracker;
  };
}
