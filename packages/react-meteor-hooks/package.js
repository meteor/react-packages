Package.describe({
  name: 'react-meteor-hooks',
  summary: 'Proposal for react-hooks getting meteor data',
  version: '0.1.0',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages',
});

Package.onUse(function (api) {
  api.versionsFrom('1.3');
  api.use('tracker');
  api.use('ecmascript');
  api.use('tmeasday:check-npm-versions@0.3.2');

  api.export([]);

  api.mainModule('react-meteor-hooks.jsx');
});
