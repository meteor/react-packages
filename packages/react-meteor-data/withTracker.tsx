import React, { forwardRef, memo } from 'react';
import useTracker from './useTracker';

type ReactiveFn = (props: object) => any;
type ReactiveOptions = {
  getMeteorData: ReactiveFn;
  pure?: boolean;
}

export default function withTracker(options: ReactiveFn | ReactiveOptions) {
  return (Component: React.ComponentType) => {
    const getMeteorData = typeof options === 'function'
      ? options
      : options.getMeteorData;

    const WithTracker = forwardRef((props, ref) => {
      const data = useTracker(() => getMeteorData(props) || {});
      return (
        <Component ref={ref} {...props} {...data} />
      );
    });

    // @ts-ignore
    const { pure = true } = options;
    return pure ? memo(WithTracker) : WithTracker;
  }
};
