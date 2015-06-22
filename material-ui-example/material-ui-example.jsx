var ThemeManager = new mui.Styles.ThemeManager();
var RaisedButton = mui.RaisedButton;

var App = React.createClass({
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  render: function() {
    return (
      <RaisedButton label="Default" />
    );
  }
});

if (Meteor.isClient) {
  Meteor.startup(function () {
    React.render(<App />, document.body);
  });
}
