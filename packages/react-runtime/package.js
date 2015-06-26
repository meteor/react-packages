Package.describe({
  name: 'react-runtime',
  version: '0.13.3',
  // Brief, one-line summary of the package.
  summary: 'Facebook\'s React library',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/meteor/react-packages',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.imply('react-runtime-dev@=0.13.3');
  api.imply('react-runtime-prod@=0.13.3');
});
