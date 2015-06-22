Babel = Npm.require('babel-core');

// See README.md in this directory for more information.

Babel.transformMeteor = function (code, extraOptions) {
  extraOptions = _.extend({}, extraOptions); // clone

  var options = {
    whitelist: [
      'es3.propertyLiterals',
      'es3.memberExpressionLiterals',
      'es6.arrowFunctions',
      'es6.templateLiterals',
      'es6.classes',
      'es6.blockScoping',
      "es6.properties.shorthand",
      "es6.properties.computed",
      "es6.parameters.rest",
      "es6.parameters.default",
      "es6.spread",
      "es6.destructuring",
      "es6.constants",
      "es7.objectRestSpread",
      'es7.trailingFunctionCommas',
      "flow"
    ].concat(extraOptions.extraWhitelist || []),
    externalHelpers: true,
    // "Loose" mode gets us faster and more IE-compatible transpilations of:
    // classes, computed properties, modules, for-of, and template literals.
    // Basically all the transformers that support "loose".
    // http://babeljs.io/docs/usage/loose/
    loose: "all"
  };

  delete extraOptions.extraWhitelist;
  return Babel.transform(code, _.extend(options, extraOptions));
};

// fake Underscore, since we can't depend on the Underscore package
// and still be loaded by the tool (before building other packages).
var hasOwnProperty = Object.prototype.hasOwnProperty;
var _ = {
  // Doesn't support more than two arguments (more than one "source"
  // object).
  extend: function (tgt, src) {
    for (var k in src) {
      if (hasOwnProperty.call(src, k))
        tgt[k] = src[k];
    }
    return tgt;
  }
};
