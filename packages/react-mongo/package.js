/* global Package */

Package.describe({
  name: 'react-mongo',
  summary: 'React hook for reactively tracking Meteor data',
  version: '0.9.0',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages',
});

Package.onUse(function (api) {
  api.versionsFrom('1.10');
  api.use('tracker');
  api.use('typescript');

  api.mainModule('react-mongo.ts', ['client', 'server'], { lazy: true });
});
