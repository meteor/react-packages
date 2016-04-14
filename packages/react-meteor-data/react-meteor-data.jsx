import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';
checkNpmVersions({
  react: '15.x',
  'react-addons-pure-render-mixin': '15.x',
}, 'react-meteor-data');

const createContainer = require('./createContainer.jsx').default;
const ReactMeteorData = require('./ReactMeteorData.jsx').default;

export { createContainer, ReactMeteorData };
