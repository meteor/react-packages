Package.describe({
  name: "react-meteor-data",
  summary: "React mixin for reactively tracking Meteor data",
  version: '0.0.1',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.use('jsx');

  api.export(['MeteorDataMixin']);

  api.addFiles('meteor-data-mixin.jsx');
});

Package.onTest(function (api) {
  api.use('tinytest');
  api.use('test-helpers');
  api.use('react-meteor-data');
  api.use('react-runtime');
  api.use('jsx');
  api.use('reactive-var');
  api.use('underscore');

  api.addFiles('mixin-tests-server.jsx', 'server');
  api.addFiles('mixin-tests.jsx', 'client');
});
