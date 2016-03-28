// Note that we can't run these tests right now due to https://github.com/meteor/meteor/issues/6401
// But it's useful to have them here for reference (you can run them in a browser console in
//   and app that includes this package)

var React = Package["react-runtime-dev"].ReactDev;
var ReactDOM = Package["react-runtime-dev"].ReactDOMDev;

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

Tinytest.add('react-runtime-dev - is actually the development version', function (test) {
  // Make sure we don't have debug-only addons
  test.isNotUndefined(React.addons.TestUtils);
  test.isNotUndefined(React.addons.Perf);

  // Check if we print an error to console about props
  let error;

  var oldError = console.error;
  try {
    console.error = function specialError(message) {
      error = message;
    };

    var div = document.createElement("DIV");
    ReactDOM.render(<ComponentWithRequiredProp />, div);

    test.isNotUndefined(error);
  } finally {
    console.error = oldError;
  }

  // It should throw when style is not an object
  var div = document.createElement("DIV");
  try {
    ReactDOM.render(<div style="mystyle" />, div);
  } catch (e) {
    // The development build has the right error message
    test.matches(e.message, /^Invariant Violation/);
  }
});
