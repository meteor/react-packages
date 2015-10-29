Meteor.startup(function () {
  injectTapEventPlugin();
  ReactDOM.render(<App />, document.getElementById("container"));
});
