Tinytest.add("jsx - basic", function (test) {
  var React = {
    createElement: function (...stuff) {
      return [...stuff];
    }
  };
  var props = {className: "foo"};
  test.equal(<div {...props}>Hi</div>,
             ['div', {className: "foo"}, 'Hi']);
});
