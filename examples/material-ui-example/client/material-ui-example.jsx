var ThemeManager = new mui.Styles.ThemeManager();

var {
  AppBar,
  DatePicker,
  TextField
} = mui;

React.initializeTouchEvents(true)

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
        <DatePicker hintText="Landscape Dialog" mode="landscape"/>
        <TextField hintText="Hint Text" />
      </div>
    );
  }
});

if (Meteor.isClient) {
  Meteor.startup(function () {
    var WebFontConfig = {
      google: { families: [ 'Roboto:400,300,500:latin' ] }
    };
    (function() {
      var wf = document.createElement('script');
      wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
      wf.type = 'text/javascript';
      wf.async = 'true';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wf, s);
    })();

    injectTapEventPlugin();

    $(document.body).html("<div id='container'></div>");
    React.render(<App />, document.getElementById("container"));
  });
}
