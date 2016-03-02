Package.describe({
  name: 'react-runtime-dev',
  version: '0.14.4',
  // Brief, one-line summary of the package.
  summary: 'Development version of the React runtime library with addons.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/meteor/react-packages',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
  debugOnly: true
});

Package.onUse(function (api) {
  api.versionsFrom('1.3-beta.11');
  api.use(['ecmascript', 'tmeasday:check-npm-versions']);
  api.mainModule('react.js');
});
