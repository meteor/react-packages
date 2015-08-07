// React contains this code, but it doesn't run it soon enough to be helpful.
// Also, this way we get to print a meteor-specific error message, though
// in addition we modify React's error message with a search-and-replace in
// the Browserify options.

var expectedFeatures = [
  Array.isArray,
  Array.prototype.every,
  Array.prototype.forEach,
  Array.prototype.indexOf,
  Array.prototype.map,
  Date.now,
  Function.prototype.bind,
  Object.keys,
  String.prototype.split,
  String.prototype.trim
];

for (var i = 0; i < expectedFeatures.length; i++) {
  if (!expectedFeatures[i]) {
    console.error(
      'One or more ES5 shims expected by React are not available: ' +
        'Add the es5-shim package with `meteor add es5-shim`'
    );
    break;
  }
}
