Package.describe({
  name: 'react-runtime-dev',
  version: '0.14.3',
  // Brief, one-line summary of the package.
  summary: 'Development version of the React runtime library with addons.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/meteor/react-packages',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
  debugOnly: true
});

Npm.depends({
  "react"                            : "0.14.3",
  "react-dom"                        : "0.14.3",
  "browserify-replace-g"             : "0.9.1",
  "react-addons-transition-group"    : "0.14.3",
  "react-addons-css-transition-group": "0.14.3",
  "react-addons-linked-state-mixin"  : "0.14.3",
  "react-addons-create-fragment"     : "0.14.3",
  "react-addons-update"              : "0.14.3",
  "react-addons-pure-render-mixin"   : "0.14.3",
  "react-addons-test-utils"          : "0.14.3",
  "react-addons-perf"                : "0.14.3"
});

Package.onUse(function (api) {
  api.use('cosmos:browserify@0.9.2');
  api.addFiles('detect-shims.js');
  api.addFiles('shams.js');
  api.addFiles('react.browserify.js');
  api.addFiles('react.browserify.options.json');
  api.addFiles('attach-require.js');

  api.export('ReactDev');
  api.export('ReactDOMDev');
  api.export('ReactDOMServerDev', 'server');
});

Package.onTest(function (api) {
  api.versionsFrom('METEOR@1.1.0.2');
  api.use('tinytest');
  api.use('jsx@0.2.4');
  api.use('react-runtime-dev');

  api.addFiles('react-runtime-dev-tests.jsx', 'client');
});
