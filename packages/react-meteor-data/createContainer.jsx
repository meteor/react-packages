/**
 * Container helper using react-meteor-data.
 */

import React from 'react';
import { connect } from './ReactMeteorData.jsx';

export default function createContainer(options = {}, Component) {
  let expandedOptions = options;
  if (typeof options === 'function') {
    expandedOptions = {
      getMeteorData: options,
    };
  }

  return connect(expandedOptions)(Component);
}
