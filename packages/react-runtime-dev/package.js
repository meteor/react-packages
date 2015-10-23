Package.describe({
  name: 'react-runtime-dev',
  version: '0.14.0',
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
  react: "0.14.0",
  "browserify-replace-g": "0.9.1"
});

Package.onUse(function (api) {
  api.use('cosmos:browserify@0.8.1');
  api.addFiles('detect-shims.js');
  api.addFiles('shams.js');
  api.addFiles('react.browserify.js');
  api.addFiles('react.browserify.options.json');
  api.addFiles('attach-require.js');

  api.export('ReactDev');
});

Package.onTest(function (api) {
  api.versionsFrom('METEOR@1.1.0.2');
  api.use('tinytest');
  api.use('jsx@0.2.1');
  api.use('react-runtime-dev');

  api.addFiles('react-runtime-dev-tests.jsx', 'client');
});
