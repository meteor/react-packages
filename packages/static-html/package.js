Package.describe({
  name: 'static-html',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: "compileStaticHtml",
  sources: ["static-html.js"],
  use: ["underscore"]
});

Package.onTest(function (api) {
  api.use('tinytest');
  api.use('underscore');

  api.addFiles([
    'static-html.js',
    'static-html-tests.js'
  ], 'server');
});
