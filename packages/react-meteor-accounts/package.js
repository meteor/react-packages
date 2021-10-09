/* global Package */

Package.describe({
  name: 'react-accounts',
  summary: 'React hook for reactively tracking Meteor data',
  version: '1.0.0',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages',
});

Package.onUse((api) => {
  api.versionsFrom(['1.10', '2.3']);
  api.use('tracker');
  api.use('typescript');

  api.mainModule('react-accounts.tsx', ['client', 'server'], { lazy: true });
});
