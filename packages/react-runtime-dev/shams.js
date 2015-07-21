// This file is duplicated between react-runtime-prod and react-runtime-dev,
// so be sure to keep them in sync.
//
// These private helpers that approximate Object.create and Object.freeze,
// in conjunction with a browserify transform that does a search-and-replace
// on the React code, remove React's dependence on es5-sham.  See also
// https://github.com/facebook/react/issues/4189.

Object_create = (Object.create || function (proto, props) {
  if (proto === null) {
    throw new Error("This sham does not support Object.create(null)");
  } else if (props) {
    throw new Error("This sham does not support Object.create(..., props)");
  }

  var Type = function Type() {}; // An empty constructor.
  Type.prototype = proto;
  return new Type();
});

Object_freeze = (Object.freeze || function (obj) { return obj; });
