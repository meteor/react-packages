/* global Package */

Package.describe({
  name: 'react-accounts',
  summary: 'React hook for reactively tracking Meteor Accounts data',
  version: '1.0.0-beta.1',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages',
});

Package.onUse((api) => {
  api.versionsFrom(['1.10', '2.3']);

  api.use(['accounts-base', 'tracker', 'typescript']);

  api.mainModule('index.ts', ['client', 'server'], { lazy: true });
});
