/* global Package */

Package.describe({
  name: 'react-meteor-data',
  summary: 'React higher-order component for reactively tracking Meteor data',
  version: '0.2.16',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages',
});

Package.onUse((api) => {
  api.versionsFrom('1.3');
  api.use('tracker');
  api.use('ecmascript');

  api.mainModule('index.js');
});

Package.onTest((api) => {
  api.use(['ecmascript', 'reactive-dict', 'tracker', 'tinytest']);
  api.use('react-meteor-data');
  api.mainModule('tests.js');
});
