/* global Package */

Package.describe({
  name: 'react-meteor-data',
  summary: 'React hook for reactively tracking Meteor data',
  version: '4.1.0-beta.1',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages'
})

Npm.depends({
  'fast-equals': '5.2.2'
})

// Supported versions of the `typescript` Meteor package. This is set
// explicitly instead of being derived from `api.versionsFrom` because
// TypeScript 6.x is not yet part of any published Meteor release, so it can't
// be pulled in through `versionsFrom`. The 3.7.0/4.1.2/4.3.2/5.4.3 entries
// mirror the typescript versions shipped by the releases listed in
// `versionsFrom` below; 6.0.0 adds compatibility with releases on TypeScript 6
// (see meteor/meteor#14560). The 7.0.2 entry supports Meteor releases built
// against TypeScript 7 (see meteor/meteor#14319).
const TYPESCRIPT_VERSIONS = 'typescript@3.7.0 || 4.1.2 || 4.3.2 || 5.4.3 || 6.0.0 || 7.0.2'

Package.onUse((api) => {
  api.versionsFrom(['1.8.2', '1.12', '2.0', '2.3', '3.0'])
  api.use('tracker')
  api.use('ecmascript')
  api.use(TYPESCRIPT_VERSIONS)
  api.use('zodern:types@1.0.13', 'server')

  api.mainModule('index.ts', ['client', 'server'], { lazy: true })
})

Package.onTest((api) => {
  api.use(['ecmascript', 'reactive-dict', 'reactive-var', 'tracker', 'tinytest', 'underscore', 'mongo'])
  api.use(TYPESCRIPT_VERSIONS)
  api.use('test-helpers')
  api.use('react-meteor-data')
  api.use('jquery@3.0.0', 'client');

  api.mainModule('tests.js');
})
