// These are tests of Babel's generated output.  Write tests here when a runtime
// test won't do.  Some tests also serve to catch when Babel changes its output,
// such as when it changes its runtime helpers!


var transform = function (input) {
  return Babel.transformMeteor(input).code;
};

var contains = function (haystack, needle) {
  return haystack.indexOf(needle) >= 0;
};

Tinytest.add("babel - transpilation - const", function (test) {
  // make sure `const` is turned into `var` (rather than passing
  // through, such as when you have es6.blockScoping on but
  // es6.constants off)
  var output = transform('const x = 5;');
  test.isFalse(contains(output, 'const'));
  test.isTrue(contains(output, 'var'));
});

Tinytest.add("babel - transpilation - class methods", function (test) {
  var output = transform(
`class Foo {
  static staticMethod() {
    return 'classy';
  }

  prototypeMethod() {
    return 'prototypical';
  }

  [computedMethod]() {
    return 'computed';
  }
}`);

  // test that we are in "loose" mode and methods of classes are still
  // assigned in a simple matter that does rely on Object.defineProperty.
  test.isTrue(contains(output, 'Foo.staticMethod = function staticMethod('));
  test.isTrue(contains(output,
                       'Foo.prototype.prototypeMethod = function prototypeMethod('));
  test.isTrue(contains(output, 'Foo.prototype[computedMethod] = function ('));
  test.isFalse(contains(output, 'createClass'));
});

Tinytest.add("babel - transpilation - helpers - classCallCheck", function (test) {
  var output = transform(`
class Foo {
  constructor(x) {
    this.x = x;
  }
}`);

  // test that the classCallCheck helper is still in use
  test.isTrue(contains(output, 'babelHelpers.classCallCheck'));
});

Tinytest.add("babel - transpilation - helpers - inherits", function (test) {
  var output = transform(`
class Foo {}
class Bar extends Foo {}
`);

  test.isTrue(contains(output, 'babelHelpers.inherits'));
});

Tinytest.add("babel - transpilation - helpers - bind", function (test) {
  var output = transform(`
  var foo = new Foo(...oneTwo, 3);
`);

  test.isTrue(contains(output, 'babelHelpers.bind'));
});

Tinytest.add("babel - transpilation - helpers - extends", function (test) {
  var output = transform(`
  var full = {a:1, ...middle, d:4};
`);

  test.isTrue(contains(output, 'babelHelpers._extends'));
});

Tinytest.add("babel - transpilation - helpers - objectWithoutProperties", function (test) {
  var output = transform(`
var {a, ...rest} = obj;
`);

  test.isTrue(contains(output, 'babelHelpers.objectWithoutProperties'));
});

Tinytest.add("babel - transpilation - helpers - objectDestructuringEmpty", function (test) {
  var output = transform(`
var {} = null;
`);

  test.isTrue(contains(output, 'babelHelpers.objectDestructuringEmpty'));
});

Tinytest.add("babel - transpilation - helpers - taggedTemplateLiteralLoose", function (test) {
  var output = transform(`
var x = asdf\`A\${foo}C\`
`);

  test.isTrue(contains(output, 'babelHelpers.taggedTemplateLiteralLoose'));
});

Tinytest.add("babel - transpilation - helpers - createClass", function (test) {
  var output = transform(`
class Foo {
  get blah() { return 123; }
}
`);

  test.isTrue(contains(output, 'babelHelpers.createClass'));
});

Tinytest.add("babel - transpilation - flow", function (test) {
  var output = transform(
    'var foo = function (one: any, two: number, three?): string {};');
  test.isTrue(contains(output, '(one, two, three)'));
});
