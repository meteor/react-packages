var React = Package["react-runtime-dev"].ReactDev;

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
  // Check if we print a warning to console about props
  let warning;

  var oldError = console.error;
  try {
    console.error = function specialWarn(message) {
      warning = message;
    };

    var div = document.createElement("DIV");
    React.render(<ComponentWithRequiredProp />, div);

    test.isNotUndefined(warning);
  } finally {
    console.error = oldError;
  }

  // It should throw when style is not an object
  var div = document.createElement("DIV");
  try {
    React.render(<div style="mystyle" />, div);
  } catch (e) {
    // The development build has the right error message
    test.matches(e.message, /^Invariant Violation/);
  }
});
