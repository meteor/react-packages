Package.describe({
  name: 'react-runtime',
  version: '0.14.0',
  // Brief, one-line summary of the package.
  summary: "Facebook's React library",
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/meteor/react-packages',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use('react-runtime-dev@=0.14.0');
  api.use('react-runtime-prod@=0.14.0');
  api.addFiles('react-runtime.js');

  api.export('React');
});
