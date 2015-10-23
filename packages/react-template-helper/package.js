Package.describe({
  name: 'react-template-helper',
  version: '0.1.6',
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

  api.use([
    'templating',
    'react-runtime@0.14.0',
    'underscore'
  ]);

  api.addFiles(['react-template-helper.js'], 'client');
});

Package.onTest(function(api) {
  api.versionsFrom('METEOR@1.1.0.2');
  api.use([
    'templating',
    'tinytest',
    'reactive-var',
    'react-template-helper',
    'test-helpers',
    'jsx@0.2.1',
    'react-runtime@0.14.0',
    'tracker',
    'underscore',
    'jquery'
  ]);

  api.addFiles([
    // remove once Meteor 1.1.1 is released:
    'event_simulation.js', // copied from METEOR/packages/test-helpers/

    'test-templates.html',
    'test-components.jsx',
    'test-templates.jsx',
    'tests.jsx'
  ], 'client');
});
