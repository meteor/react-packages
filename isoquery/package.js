Package.describe({
  name: 'isoquery',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'A way to reuse queries between server publish and data filtering in client views',
  // URL to the Git repository containing the source code for this package.
  git: '',
  documentation: null
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.addFiles('isoquery.js');
  api.export("Isoquery");
});

