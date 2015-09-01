Package.describe({
  name: 'react-template-helper',
  version: '0.1.3',
  // Brief, one-line summary of the package.
  summary: 'Use React components in native Meteor templates',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/meteor/react-packages',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.1.0.2');
  api.use('templating');
  api.use('react-runtime@0.13.3_6');
  api.addFiles(['react-template-helper.js'], 'client');
});

Package.onTest(function(api) {
  api.versionsFrom('METEOR@1.1.0.2');
  api.use('templating');
  api.use('tinytest');
  api.use('reactive-var');
  api.use('react-template-helper');
  api.use('test-helpers');
  api.use('jsx@0.1.6');
  api.addFiles([
    // remove once Meteor 1.1.1 is released:
    'event_simulation.js', // copied from METEOR/packages/test-helpers/

    'test-templates.html',
    'test-components.jsx',
    'test-templates.jsx',
    'tests.jsx'
  ], 'client');
});
