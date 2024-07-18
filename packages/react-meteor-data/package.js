/* global Package */

Package.describe({
  name: 'react-meteor-data',
  summary: 'React hook for reactively tracking Meteor data',
  version: '3.0.1',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages'
})

Npm.depends({
  'lodash.isequal': '4.5.0',
  'lodash.remove': '4.7.0'
})

Package.onUse((api) => {
  api.versionsFrom(['1.8.2', '1.12', '2.0', '2.3', '3.0'])
  api.use('tracker')
  api.use('ecmascript')
  api.use('typescript')
  api.addAssets('react-meteor-data.d.ts', 'server')
  api.addAssets('suspense/react-meteor-data.d.ts', 'server')

  api.mainModule('index.js', ['client', 'server'], { lazy: true })
})

Package.onTest((api) => {
  api.use(['ecmascript', 'typescript', 'reactive-dict', 'reactive-var', 'tracker', 'tinytest', 'underscore', 'mongo'])
  api.use('test-helpers')
  api.use('react-meteor-data')
  api.mainModule('tests.js')
})
