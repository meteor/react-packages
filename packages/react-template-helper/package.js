Package.describe({
  name: 'react-template-helper',
  version: '0.4.0-rc.1',
  // Brief, one-line summary of the package.
  summary: 'Use React components in native Meteor templates',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/meteor/react-packages',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});

Package.onUse((api) => {
  api.versionsFrom(['1.3', '2.3', '3.0']);

  api.use([
    'templating',
    'underscore',
    'ecmascript',
    'tmeasday:check-npm-versions@2.0.0',
  ]);

  api.addFiles(['react-template-helper.js'], 'client');
});
