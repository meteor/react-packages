/* global Package */

Package.describe({
  name: 'react-meteor-data',
  summary: 'React hook for reactively tracking Meteor data',
  version: '2.3.0',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages',
});

Package.onUse(function (api) {
  api.versionsFrom(['1.8.2', '1.12', '2.0']);
  api.use('tracker');
  api.use('ecmascript');
  api.use('typescript');

  api.mainModule('index.js', ['client', 'server'], { lazy: true });
});

Package.onTest(function (api) {
  api.use(['ecmascript', 'typescript', 'reactive-dict', 'reactive-var', 'tracker', 'tinytest', 'underscore', 'mongo']);
  api.use('test-helpers');
  api.use('react-meteor-data');
  api.mainModule('tests.js');
});
