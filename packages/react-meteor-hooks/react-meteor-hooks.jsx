import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

checkNpmVersions({
  react: '16.7.0-alpha.0',
}, 'react-meteor-hooks');

export { default as useMeteorSubscription } from './useMeteorSubscription.jsx';
export { default as useMeteorData } from './useMeteorData.jsx';
