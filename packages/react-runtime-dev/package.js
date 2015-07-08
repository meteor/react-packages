Package.describe({
  name: 'react-runtime-dev',
  version: '0.13.3_1',
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
  react: "0.13.3"
});

Package.onUse(function (api) {
  api.use('cosmos:browserify@0.4.0');
  api.addFiles('react.browserify.js');
  api.addFiles('react.browserify.options.json');
  api.addFiles('attach-require.js');

  // Load Order: If both react-runtime-dev and react-runtime-prod are loaded,
  // load react-runtime-dev last so that the React DevTools work properly.
  // (The react-runtime package currently loads both because there's no way
  // to have a prod-only dependency or a prod-only file in a package.)
  api.use('react-runtime-prod', {weak: true});

  api.export('ReactDev');
});
