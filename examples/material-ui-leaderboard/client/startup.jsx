Meteor.startup(function () {
  injectTapEventPlugin();
  $(document.body).html("<div id='container'></div>");
  React.render(<App />, document.getElementById("container"));
});
