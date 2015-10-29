Package.describe({
  name: "react-meteor-data",
  summary: "React mixin for reactively tracking Meteor data",
  version: '0.2.2',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages'
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.1.0.2');
  api.use('tracker');
  api.use('jsx@0.2.3');

  api.export(['ReactMeteorData']);

  api.addFiles('meteor-data-mixin.jsx');
});

Package.onTest(function (api) {
  api.versionsFrom('METEOR@1.1.0.2');
  api.use('tinytest');
  api.use('test-helpers');
  api.use('react-meteor-data');
  api.use('react-runtime@0.14.1');
  api.use('jsx@0.2.3');
  api.use('reactive-var');
  api.use('underscore');
  api.use('tracker');
  api.use('mongo');

  api.addFiles('mixin-tests-server.jsx', 'server');
  api.addFiles('mixin-tests.jsx', 'client');
});
