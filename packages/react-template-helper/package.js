Package.describe({
  name: 'react-template-helper',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Use React components in native Meteor templates',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/meteor/react-packages/tree/master/packages/react-template-helper',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use('templating');
  api.use('react-runtime');
  api.addFiles(['react-template-helper.html', 'react-template-helper.js'], 'client');
});

Package.onTest(function(api) {
  api.use('templating');
  api.use('tinytest');
  api.use('reactive-var');
  api.use('react-template-helper');
  api.use('test-helpers');
  api.use('jsx');
  api.addFiles([
    'test-templates.html',
    'test-components.jsx',
    'test-templates.jsx',
    'tests.jsx'
  ], 'client');
});
