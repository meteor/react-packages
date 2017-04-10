import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

checkNpmVersions({
  react: '15.x',
}, 'react-meteor-data');

const createContainer = require('./createContainer.jsx').default;

export { createContainer };
