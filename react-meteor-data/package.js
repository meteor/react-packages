Package.describe({
  name: "react-meteor-data",
  summary: "React mixin for reactively tracking Meteor data",
  version: '0.0.1',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.use('jsx');

  api.export(['MeteorDataMixin']);

  api.addFiles('meteor-data-mixin.jsx');
});
