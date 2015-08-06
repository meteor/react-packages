var React = ReactProd;

var ComponentWithRequiredProp = React.createClass({
  propTypes: {
    requiredString: React.PropTypes.string.isRequired
  },
  render() {
    return (
      <div>Nothing useful here...</div>
    );
  }
});

Tinytest.add('react-runtime-prod - is actually the production version', function (test) {
  // Make sure we don't have debug-only addons
  test.isUndefined(React.addons.TestUtils);
  test.isUndefined(React.addons.Perf);

  // Check if we print a warning to console about props
  // You can be sure this test is correct because we have an identical one in
  // react-runtime-dev
  let warning;

  var oldWarn = console.warn;
  console.warn = function specialWarn(message) {
    warning = message;
  };

  var div = document.createElement("DIV");
  React.render(<ComponentWithRequiredProp />, div);

  test.isUndefined(warning);

  console.warn = oldWarn;
});
