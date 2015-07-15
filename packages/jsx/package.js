Package.describe({
  name: "jsx",
  summary: "Build plugin that transpiles .jsx files using Babel",
  version: '0.1.2',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: 'transpileJSX',
  use: ['babel-compiler@5.6.15'],
  sources: [
    'jsx-plugin.js'
  ]
});

Package.onUse(function (api) {
  // We need the Babel helpers as a run-time dependency of the generated code.
  api.imply('babel-runtime@0.1.1');
});
