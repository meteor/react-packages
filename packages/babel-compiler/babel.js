var meteorBabel = Npm.require('meteor-babel');

// See README.md in this directory for more information.

Babel = {
  transformMeteor: function (code, extraOptions) {
    // See https://github.com/meteor/babel/blob/master/options.js if you
    // want to know what these default options are.
    var options = meteorBabel.getDefaultOptions();
    delete options.sourceMap;

    if (extraOptions) {
      if (extraOptions.extraWhitelist) {
        options.whitelist.push.apply(
          options.whitelist,
          extraOptions.extraWhitelist
        );
      }

      for (var key in extraOptions) {
        if (key !== "extraWhitelist" &&
            hasOwnProperty.call(extraOptions, key)) {
          options[key] = extraOptions[key];
        }
      }
    }

    return meteorBabel.compile(code, options);
  }
};
