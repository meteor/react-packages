Package.describe({
  name: 'react',
  version: '15.0.2',
  // Brief, one-line summary of the package.
  summary: 'Everything you need to use React with Meteor.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/meteor/react-packages',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3');
  
  api.addFiles('react.js');

  api.imply([
    'ecmascript',
    'react-runtime@15.0.2',
    'react-meteor-data@0.2.16'
  ]);
});
