/* global Meteor*/
import React from 'react';

if (Meteor.isDevelopment) {
  const v = React.version.split('.');
  if (v[0] < 16 || v[1] < 8) {
    console.warn('react-meteor-data 2.x requires React version >= 16.8.');
  }
}

// When rendering on the server, we don't want to use the Tracker.
// We only do the first rendering on the server so we can get the data right away
import useTrackerClient from './useTracker.js';
const useTrackerServer = (reactiveFn) => reactiveFn();
const useTracker = (Meteor.isServer)
  ? useTrackerServer
  : useTrackerClient;

export { useTracker };
export { default as withTracker } from './withTracker.jsx';
