/* global Package */

Package.describe({
  name: 'react-meteor-accounts',
  summary: 'React hooks and HOCs for reactively tracking Meteor Accounts data',
  version: '1.1.0-beta.0',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages',
});

// `react-meteor-accounts` is implemented in TypeScript, so the compiler must
// remain an onUse dependency. Declare the supported compiler versions
// explicitly because TypeScript 6 and 7 are not represented by a published
// Meteor release in api.versionsFrom.
const TYPESCRIPT_VERSIONS = 'typescript@3.7.5 || 4.3.2 || 5.4.3 || 6.0.0 || 7.0.2';

Package.onUse((api) => {
  api.versionsFrom(['1.10', '2.3', '3.0']);

  api.use(['accounts-base', 'tracker']);
  api.use(TYPESCRIPT_VERSIONS);

  api.mainModule('index.ts', ['client', 'server'], { lazy: true });
});

Package.onTest((api) => {
  api.use([
    'accounts-base',
    'accounts-password',
    'tinytest',
    'tracker',
  ]);
  api.use(TYPESCRIPT_VERSIONS);

  api.mainModule('index.tests.ts');
});
