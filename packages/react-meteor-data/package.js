Package.describe({
  name: 'react-meteor-data',
  summary: 'React mixin for reactively tracking Meteor data',
  version: '0.2.6-beta.16',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages',
});

Package.onUse(function (api) {
  api.versionsFrom('1.3-beta.16');
  api.use('tracker');
  api.use('ecmascript');

  api.export(['ReactMeteorData']);

  api.mainModule('react-meteor-data.jsx');
});
