var ThemeManager = new mui.Styles.ThemeManager();

var {
  AppBar,
  DatePicker,
  Snackbar
} = mui;

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
      <div>
        <AppBar title='Title' iconClassNameRight="muidocs-icon-navigation-expand-more"/>
        <DatePicker />
        <Snackbar
          message="Event added to your calendar"
          action="undo"
          onActionTouchTap={this._handleAction}/>
      </div>
    );
  }
});

if (Meteor.isClient) {
  Meteor.startup(function () {
    React.render(<App />, document.body);
  });
}
