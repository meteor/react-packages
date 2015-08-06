Package.describe({
  name: "react-meteor-data",
  summary: "React mixin for reactively tracking Meteor data",
  version: '0.1.0',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages'
});

Package.onUse(function (api) {
  api.use('jsx@0.1.0');

  api.export(['ReactMeteorData']);

  api.addFiles('meteor-data-mixin.jsx');
});

Package.onTest(function (api) {
  api.versionsFrom('METEOR@1.1.0.2');
  api.use('tinytest');
  api.use('test-helpers');
  api.use('react-meteor-data');
  api.use('react-runtime@0.13.3');
  api.use('jsx@0.1.0');
  api.use('reactive-var');
  api.use('underscore');

  api.addFiles('mixin-tests-server.jsx', 'server');
  api.addFiles('mixin-tests.jsx', 'client');
});
