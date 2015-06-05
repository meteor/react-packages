// This data is used on every page; also we want to make sure we route to the
// first list instead of no list at all
FlowRouter.subscriptions = function () {
  this.register('publicLists', Meteor.subscribe('publicLists'));
  this.register('privateLists', Meteor.subscribe('privateLists'));
};

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
  // If the data's ready, and we are at the root route, we should go to a valid list
  if (FlowRouter.subsReady() && FlowRouter.getRouteName() === "root") {
    FlowRouter.go("todoList", { listId: Lists.findOne()._id });
    computation.stop();
  }
});
