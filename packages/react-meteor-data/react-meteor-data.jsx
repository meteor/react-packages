import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';
checkNpmVersions({
  react: '0.14.x',
  'react-addons-pure-render-mixin': '0.14.x'
});

import createContainer from './createContainer.jsx';
import ReactMeteorData from './ReactMeteorData.jsx';

export { createContainer, ReactMeteorData };
