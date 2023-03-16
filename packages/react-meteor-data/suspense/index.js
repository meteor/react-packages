import React from 'react'

if (Meteor.isDevelopment) {
  const v = React.version.split('.')
  if (v[0] < 16 || (v[0] == 16 && v[1] < 8)) {
    console.warn('react-meteor-data 2.x requires React version >= 16.8.')
  }
}

export { useFind } from './useFind'
export { useSubscribe } from './useSubscribe'
export { useTracker } from './useTracker'
