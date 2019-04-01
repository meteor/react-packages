import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

checkNpmVersions({
  react: '16.8',
}, 'react-meteor-data');

export { default as withTracker } from './withTracker.jsx';
export { default as useTracker } from './useTracker.js';
