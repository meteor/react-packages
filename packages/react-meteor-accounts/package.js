/* global Package */

Package.describe({
  name: 'react-meteor-accounts',
  summary: 'React hooks and HOCs for reactively tracking Meteor Accounts data',
  version: '1.0.3-rc300.0',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages',
});

Package.onUse((api) => {
  api.versionsFrom(['1.10', '2.3', '3.0-rc.0']);

  api.use(['accounts-base', 'tracker', 'typescript']);

  api.mainModule('index.ts', ['client', 'server'], { lazy: true });
});

Package.onTest((api) => {
  api.use([
    'accounts-base',
    'accounts-password',
    'tinytest',
    'tracker',
    'typescript',
  ]);

  api.mainModule('index.tests.ts');
});
