// This data is used on every page; also we want to make sure we route to the
// first list instead of no list at all
var handles = [
  Meteor.subscribe("publicLists"),
  Meteor.subscribe("privateLists")
];
var subsReady;

FlowRouter.route("/", {
  name: "root",
  action: function () {
    if (subsReady) {
      FlowRouter.go("todoList", { listId: Lists.findOne()._id });
    }

    React.render(<AppBody listId={ null } handles={ handles } />,
      document.body);
  }
});

FlowRouter.route("/lists/:listId", {
  name: "todoList",
  action: function (params) {
    React.render(<AppBody listId={ params.listId } handles={ handles } />,
      document.body);
  }
});

// XXX this should be replaced by promises, probably...
Tracker.autorun(function (computation) {
  // Are all of the subscriptions done yet?
  subsReady = _.all(handles, function (handle) {
    return handle.ready();
  });

  // If they are, and we are at the root route, we should go to a valid list
  if (subsReady && FlowRouter.getRouteName() === "root") {
    FlowRouter.go("todoList", { listId: Lists.findOne()._id });
    computation.stop();
  }
});
