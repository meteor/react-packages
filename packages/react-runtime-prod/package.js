Package.describe({
  name: 'react-runtime-prod',
  version: '0.13.3_1',
  // Brief, one-line summary of the package.
  summary: 'Production version of the React runtime library with addons.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/meteor/react-packages',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  react: "0.13.3",
  "browserify-replace-g": "0.9.1"
});

Package.onUse(function (api) {
  api.use('cosmos:browserify@0.4.0');
  api.addFiles('shams.js');
  api.addFiles('devtools-fix.js');
  api.addFiles('react.browserify.js');
  api.addFiles('react.browserify.options.json');
  api.addFiles('attach-require.js');

  // Load Order: If both react-runtime-dev and react-runtime-prod are loaded
  // (which is what we do in dev mode, because we have a flag debugOnly
  // but we don't currently have one called prodOnly), make sure "dev" loads
  // first, so we get proper errors if polyfills are missing.
  api.use('react-runtime-dev@0.0.0', {weak: true});

  api.export('ReactProd');
});

Package.onTest(function (api) {
  api.versionsFrom('METEOR@1.1.0.2');
  api.use('tinytest');
  api.use('jsx@0.1.0');
  api.use('react-runtime-prod');

  api.addFiles('react-runtime-prod-tests.jsx', 'client');
});
