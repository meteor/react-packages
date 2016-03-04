// Note that we can't run these tests right now due to https://github.com/meteor/meteor/issues/6401
// But it's useful to have them here for reference (you can run them in a browser console in
//   and app that includes this package, running in `--production`)

var React = ReactProd;
var ReactDOM = ReactDOMProd;

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

  // Check if we print an error to console about props
  // You can be sure this test is correct because we have an identical one in
  // react-runtime-dev
  let error;
  try {
    var oldError = console.error;
    console.error = function specialError(message) {
      error = message;
    };

    var div = document.createElement("DIV");
    ReactDOM.render(<ComponentWithRequiredProp />, div);

    test.isUndefined(error);
  } finally {
    console.error = oldError;
  }

  // It should throw when style is not an object
  var div = document.createElement("DIV");
  try {
    ReactDOM.render(<div style="mystyle" />, div);
  } catch (e) {
    // The production build doesn't have the error message
    test.matches(e.message, /^Minified exception/);
  }
});
