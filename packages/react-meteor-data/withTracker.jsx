import React, { memo } from 'react';
import useTracker from './useTracker.js';

export default function withTracker(options) {
  return Component => {
    const expandedOptions = typeof options === 'function' ? { getMeteorData: options } : options;
    const { getMeteorData, pure = true } = expandedOptions;

    function WithTracker(props) {
      const data = useTracker(() => getMeteorData(props) || {}, [props]);

      if (Package.mongo && Package.mongo.Mongo && data) {
        Object.keys(data).forEach((key) => {
          if (data[key] instanceof Package.mongo.Mongo.Cursor) {
            console.warn(
              'Warning: you are returning a Mongo cursor from withTracker. '
              + 'This value will not be reactive. You probably want to call '
              + '`.fetch()` on the cursor before returning it.'
            );
          }
        });
      }

      return data ? <Component {...{ ...props, ...data }} /> : null;
    }

    return pure ? memo(WithTracker) : WithTracker;
  };
}
