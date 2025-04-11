import React, { forwardRef, memo } from 'react';
import { useTracker } from './useTracker';
import { Meteor } from 'meteor/meteor';

type ReactiveFn = (props: object) => any;
type ReactiveOptions = {
  getMeteorData: ReactiveFn;
  pure?: boolean;
  skipUpdate?: (prev: any, next: any) => boolean;
}

export const withTracker = (options: ReactiveFn | ReactiveOptions) => {
  return (Component: React.ComponentType) => {
    if (Meteor.isDevelopment) {
      console.warn('It appears that you are using withTracker. This approach has been deprecated and will be removed in future versions of the package. Please migrate to using hooks.')
    }
    const getMeteorData = typeof options === 'function'
      ? options
      : options.getMeteorData;

    const WithTracker = forwardRef((props, ref) => {
      const data = useTracker(
        () => getMeteorData(props) || {},
        (options as ReactiveOptions).skipUpdate
      );
      return (
        <Component ref={ref} {...props} {...data} />
      );
    });

    const { pure = true } = options as ReactiveOptions;
    return pure ? memo(WithTracker) : WithTracker;
  };
}
