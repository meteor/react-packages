import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { React, ReactDOM } from 'meteor/react-runtime';

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


if (Meteor.isClient) {
  describe("react-runtime", () => {
    if (Meteor.isProduction) {
      it("should include production React", () => {
        // Make sure we don't have debug-only addons
        assert.isUndefined(React.addons.TestUtils);
        assert.isUndefined(React.addons.Perf);

        // Check if we print an error to console about props
        let error;

        var oldError = console.error;
        try {
          console.error = function specialError(message) {
            error = message;
          };

          var div = document.createElement("DIV");
          ReactDOM.render(<ComponentWithRequiredProp />, div);

          assert.isUndefined(error);
        } finally {
          console.error = oldError;
        }

        // It should throw when style is not an object
        var div = document.createElement("DIV");
        try {
          ReactDOM.render(<div style="mystyle" />, div);
        } catch (e) {
          // The development build has the right error message
          assert.match(e.message, /^Minified exception/);
        }
      });  
    } else {
      it("should include development React", () => {
        // Make sure we have debug-only addons
        assert.isDefined(React.addons.TestUtils);
        assert.isDefined(React.addons.Perf);

        // Check if we print an error to console about props
        let error;

        var oldError = console.error;
        try {
          console.error = function specialError(message) {
            error = message;
          };

          var div = document.createElement("DIV");
          ReactDOM.render(<ComponentWithRequiredProp />, div);

          assert.isDefined(error);
        } finally {
          console.error = oldError;
        }

        // It should throw when style is not an object
        var div = document.createElement("DIV");
        try {
          ReactDOM.render(<div style="mystyle" />, div);
        } catch (e) {
          // The development build has the right error message
          assert.match(e.message,
            /^The `style` prop expects a mapping from style properties to values, not a string/);
        }
      });  
    }
  });  
}
