/* global Package */

Package.describe({
  name: 'react-meteor-state',
  summary: 'React hook for reactively tracking Meteor data',
  version: '0.9.0',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages',
});

Package.onUse((api) => {
  api.versionsFrom(['1.10', '2.3']);
  api.use('tracker');
  api.use('typescript');

  api.mainModule('use-meteor-state.ts', ['client', 'server'], { lazy: true });
});
