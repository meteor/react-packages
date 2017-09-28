import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

checkNpmVersions({
  react: '15.3 - 16',
}, 'react-meteor-data');

export { default as createContainer } from './createContainer.jsx';
export { default as withTracker } from './withTracker.jsx';
export { ReactMeteorData } from './ReactMeteorData.jsx';
