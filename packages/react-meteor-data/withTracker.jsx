import React, { forwardRef, memo } from 'react';
import useTracker from './useTracker.js';

export default function withTracker(options) {
  return Component => {
    const expandedOptions = typeof options === 'function' ? { getMeteorData: options } : options;
    const { getMeteorData, pure = true, deps = null } = expandedOptions;

    const WithTracker = forwardRef((props, ref) => {
      const data = useTracker(() => getMeteorData(props) || {}, deps);
      return <Component ref={ref} {...props} {...data} />;
    });

    return pure ? memo(WithTracker) : WithTracker;
  };
}
