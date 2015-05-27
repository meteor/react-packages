Package.describe({
  name: "mdg:jsx",
  summary: "Build plugin that transpiles .jsx files using Babel",
  version: '1.0.0'
});

Package.registerBuildPlugin({
  name: 'transpileJSX',
  use: ['mdg:babel'],
  sources: [
    'jsx-plugin.js'
  ]
});

Package.onUse(function (api) {
  // We need the Babel helpers as a run-time dependency of the generated code.
  api.imply('mdg:babel-runtime');
});
