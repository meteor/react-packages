import { Meteor } from 'meteor/meteor';
import React from 'react';

if (Meteor.isDevelopment) {
  // Custom check instead of `checkNpmVersions` to reduce prod bundle size (~8kb).
  const v = React.version.split('.').map(val => parseInt(val));
  if (v[0] < 16 || (v[0] === 16 && v[1] < 8)) {
    console.warn('react-meteor-accounts requires React version >= 16.8.');
  }
}

export { useUser, withUser, useUserId, withUserId } from './react-accounts';
