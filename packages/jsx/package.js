Package.describe({
  name: "jsx",
  summary: "Build plugin that transpiles .jsx files using Babel",
  version: '0.2.1',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages'
});

Package.registerBuildPlugin({
  name: 'compile-jsx',
  use: ['babel-compiler@5.8.22-rc.1'],
  sources: [
    'jsx-plugin.js'
  ]
});

Package.onUse(function (api) {
  // We need the Babel helpers as a run-time dependency of the generated code.
  api.imply('babel-runtime@0.1.4-rc.0');
  api.use('isobuild:compiler-plugin@1.0.0');
});

Package.onTest(function (api) {
  api.versionsFrom('METEOR@1.1.0.2');
  api.use('tinytest');
  api.use('underscore');
  api.use('jsx');

  api.addFiles('jsx-tests.jsx');
});
