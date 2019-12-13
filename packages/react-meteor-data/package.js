/* global Package */

Package.describe({
  name: 'react-meteor-data',
  summary: 'React hook for reactively tracking Meteor data',
  version: '2.0.1',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages',
});

Package.onUse(function (api) {
  api.versionsFrom('1.3');
  api.use('tracker');
  api.use('ecmascript');

  api.mainModule('index.js', { lazy: true });
});

Package.onTest(function (api) {
  api.use(['ecmascript', 'reactive-dict', 'reactive-var', 'tracker', 'tinytest', 'underscore', 'mongo']);
  api.use('test-helpers');
  api.use('react-meteor-data');
  api.mainModule('tests.js');
});
