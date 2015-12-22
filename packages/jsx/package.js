Package.describe({
  name: "jsx",
  summary: "Build plugin that transpiles .jsx files using Babel",
  version: '0.2.4',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages'
});

Package.onUse(function (api) {
  // The ecmascript package now supports JSX syntax in .jsx files, so the
  // jsx package can defer its own implementation to ecmascript.
  api.imply('ecmascript@0.3.0');
});

Package.onTest(function (api) {
  api.versionsFrom('METEOR@1.1.0.2');
  api.use('tinytest');
  api.use('underscore');
  api.use('jsx');

  api.addFiles('jsx-tests.jsx');
});
