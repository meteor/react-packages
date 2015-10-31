Package.describe({
  name: 'react-runtime-prod',
  version: '0.14.1',
  // Brief, one-line summary of the package.
  summary: 'Production version of the React runtime library with addons.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/meteor/react-packages',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
  prodOnly: true
});

Npm.depends({
  react                              : "0.14.1",
  "react-dom"                        : "0.14.1",
  "browserify-replace-g"             : "0.9.1",
  "react-addons-transition-group"    : "0.14.1",
  "react-addons-css-transition-group": "0.14.1",
  "react-addons-linked-state-mixin"  : "0.14.1",
  "react-addons-create-fragment"     : "0.14.1",
  "react-addons-update"              : "0.14.1",
  "react-addons-pure-render-mixin"   : "0.14.1",
  "react-addons-test-utils"          : "0.14.1"
});

Package.onUse(function (api) {
  api.use('cosmos:browserify@0.8.3');
  api.addFiles('shams.js');
  api.addFiles('react.browserify.js');
  api.addFiles('react.browserify.options.json');
  api.addFiles('attach-require.js');

  api.export('ReactProd');
  api.export('ReactDOMProd');
  api.export('ReactDOMServerProd', 'server');
});

Package.onTest(function (api) {
  api.versionsFrom('METEOR@1.1.0.2');
  api.use('tinytest');
  api.use('jsx@0.2.3');
  api.use('react-runtime-prod');

  api.addFiles('react-runtime-prod-tests.jsx', 'client');
});
