/* global Package */

Package.describe({
  name: 'react-meteor-data',
  summary: 'React hook for reactively tracking Meteor data',
  version: '4.0.1-beta.1',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages'
})

Npm.depends({
  'fast-equals': '5.2.2'
})

Package.onUse((api) => {
  api.versionsFrom(['1.8.2', '1.12', '2.0', '2.3', '3.0'])
  api.use('tracker')
  api.use('ecmascript')
  api.use('typescript')
  api.use('zodern:types@1.0.13', 'server')

  api.mainModule('index.ts', ['client', 'server'], { lazy: true })
})

Package.onTest((api) => {
  api.use(['ecmascript', 'typescript', 'reactive-dict', 'reactive-var', 'tracker', 'tinytest', 'underscore', 'mongo'])
  api.use('test-helpers')
  api.use('react-meteor-data')
  api.use('jquery@3.0.0', 'client');

  api.mainModule('tests.js');
})
