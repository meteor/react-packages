Tinytest.add("babel - runtime - template literals", function (test) {
  var dump = function (pieces) {
    return [_.extend({}, pieces),
            _.toArray(arguments).slice(1)];
  };
  var foo = 'B';
  // uses `babelHelpers.taggedTemplateLiteralLoose`
  test.equal(`\u0041${foo}C`, 'ABC');
  test.equal(dump`\u0041${foo}C`,
             [{0:'A', 1: 'C', raw: ['\\u0041', 'C']},
              ['B']]);
});

Tinytest.add("babel - runtime - classes - basic", function (test) {
  {
    class Foo {
      constructor(x) {
        this.x = x;
      }
    }

    test.throws(function () {
      Foo(); // called without `new`
    });

    test.equal((new Foo(3)).x, 3);
  }

  {
    class Bar {
      constructor(x) {
        this.x = x;
      }
    }
    class Foo extends Bar {}

    test.throws(function () {
      Foo(); // called without `new`
    });

    test.equal((new Foo(3)).x, 3);
    test.isTrue((new Foo(3)) instanceof Foo);
    test.isTrue((new Foo(3)) instanceof Bar);
  }

  {
    class Foo {
      static staticMethod() {
        return 'classy';
      }

      prototypeMethod() {
        return 'prototypical';
      }
    }

    test.equal(Foo.staticMethod(), 'classy');
    test.equal((new Foo).prototypeMethod(), 'prototypical');
  }
});

Tinytest.add("babel - runtime - classes - use before declare", function (test) {
  var x = function asdf() {};
  if (typeof 'asdf' === 'function') {
    // We seem to be in IE 8, where function names leak into the enclosing
    // scope, contrary to the spec.  In this case, Babel does not (currently)
    // throw an error if you use a class before you declare it.  (Of course,
    // any other browser can tell the developer they screwed up!)
    test.expect_fail();
  }

  test.throws(function () {
    new Foo(); // use before definition
    class Foo {}
  });
});


Tinytest.add("babel - runtime - classes - inheritance", function (test) {

  // uses `babelHelpers.inherits`
  {
    class Foo {
      static static1() {
        return 1;
      }
    }
    Foo.static2 = function () {
      return 2;
    };

    // static methods are inherited!
    class Bar extends Foo {}

    test.equal(Foo.static1(), 1);
    test.equal(Foo.static2(), 2);
    test.equal(Bar.static1(), 1);
    test.equal(Bar.static2(), 2);
  }

});

Tinytest.add("babel - runtime - classes - computed props", function (test) {
  {
    var frob = "inc";

    class Foo {
      static [frob](n) { return n+1; }
    }

    test.equal(Foo.inc(3), 4);
  }
});

if (Meteor.isServer) {
  // getters and setters don't work in all clients, but they should work
  // in classes on browsers that support them in the first place, and on
  // the server.  (Technically they just need Object.defineProperty, in
  // IE9+ and all modern environments.)
  Tinytest.add("babel - runtime - classes - getters/setters", function (test) {
    // uses `babelHelpers.createClass`
    class Foo {
      get two() { return 1+1; }
      static get three() { return 1+1+1; }
    }

    test.equal((new Foo).two, 2);
    test.equal(Foo.three, 3);
  });
}

Tinytest.add("babel - runtime - block scope", function (test) {
  {
    var buf = [];
    var thunks = [];
    var print = function (x) {
      buf.push(x);
    };
    var doLater = function (f) {
      thunks.push(f);
    };

    for (let i = 0; i < 3; i++) {
      print(i);
    }
    test.equal(buf, [0, 1, 2]);
    buf.length = 0;

    for (let i = 0; i < 3; i++) {
      doLater(function () {
        print(i);
      });
    }

    _.each(thunks, f => f());
    test.equal(buf, [0, 1, 2]);
  }
});

Tinytest.add("babel - runtime - classes - super", function (test) {
  {
    class Class1 {
      foo() { return 123; }
      static bar() { return 1; }
    }
    class Class2 extends Class1 {}
    class Class3 extends Class2 {
      foo() {
        return super.foo() + Class3.bar();
      }
    }

    test.equal((new Class3).foo(), 124);
  }

  {
    class Foo {
      constructor(value) { this.value = value; }
      x() { return this.value; }
    }

    class Bar extends Foo {
      constructor() { super(123); }
      x() { return super.x(); }
    }

    test.equal((new Bar).x(), 123);
  }
});

Tinytest.add("babel - runtime - object rest/spread", function (test) {
  var middle = {b:2, c:3};
  var full = {a:1, ...middle, d:4};
  test.equal(full, {a:1, b:2, c:3, d:4});
});

Tinytest.add("babel - runtime - spread args to new", function (test) {

  var Foo = function (one, two, three) {
    test.isTrue(this instanceof Foo);
    test.equal(one, 1);
    test.equal(two, 2);
    test.equal(three, 3);
    this.created = true;
  };

  var oneTwo = [1, 2];

  // uses `babelHelpers.bind`
  var foo = new Foo(...oneTwo, 3);
  test.isTrue(foo.created);
});

Tinytest.add("babel - runtime - destructuring", function (test) {
  // uses `babelHelpers.objectWithoutProperties` and
  // `babelHelpers.objectDestructuringEmpty`

  var obj = {a:1, b:2};
  var {a, ...rest} = obj;
  test.equal(a, 1);
  test.equal(rest, {b:2});

  var {} = {};

  test.throws(function () {
    var {} = null;
  }, /Cannot destructure undefined/);
});

Tinytest.add("babel - runtime - jsx - basic", function (test) {
  var React = {
    createElement: function (...stuff) {
      return [...stuff];
    }
  };
  var props = {className: "foo"};
  // uses `babelHelpers._extends`
  test.equal(<div {...props}>Hi</div>,
             ['div', {className: "foo"}, 'Hi']);
});
