[Babel](http://babeljs.io/) is a parser and transpiler for ECMAScript
6 syntax and beyond, which enables some upcoming JavaScript syntax
features to be used in today's browsers and runtimes.

Meteor's Babel support consists of the following core packages:

* `babel-compiler` - Exposes the [Babel API](https://babeljs.io/docs/usage/api/)
  on the symbol `Babel`.  For example, `Babel.transform(code, options)`.

* `babel-runtime` - Meteor versions of the external
  helpers used by Babel-generated code.  Meteor's core packages must run
  on IE 8 without polyfills, so these helpers cannot assume the existence
  of `Object.defineProperty`, `Object.freeze`, and so on.

* `babel-tests` - Tests of the Babel API, transpilation, and functioning
  of transpiled code.  These tests document and check our assumptions
  about Babel.

### Babel API

The `babel-compiler` package exports the `Babel` symbol, which is the same
object you get in Node from `require("babel-core")`.  You can only use it on the
server.

Example:

```js
Babel.transform('var square = (x) => x*x;',
                { whitelist: ['es6.arrowFunctions'] })
// Outputs:
// {
//   code: 'var square = function (x) {\n  return x * x;\n};'
//   ast: ...
//   ...
// }
```

Use `Babel.transformMeteor(code, [extraOptions])` to transpile code using the
default Meteor options.

Resources:

* [API docs](https://babeljs.io/docs/usage/api/)
* [List of transformers](https://babeljs.io/docs/usage/transformers/)
