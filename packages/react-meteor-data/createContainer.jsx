/**
 * Container helper using react-meteor-data.
 */

import { Meteor } from 'meteor/meteor';
import React from 'react';
import connect from './ReactMeteorData.jsx';

let hasDisplayedWarning = false;

export default function createContainer(options, Component) {
  if (!hasDisplayedWarning && Meteor.isDevelopment) {
    console.warn(
      'Warning: createContainer was deprecated in react-meteor-data@0.2.13. Use withTracker instead.\n' +
        'https://github.com/meteor/react-packages/tree/devel/packages/react-meteor-data#usage',
    );
    hasDisplayedWarning = true;
  }

  return connect(options)(Component);
}
