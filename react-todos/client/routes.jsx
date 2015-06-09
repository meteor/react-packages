var {
  Route,
  NotFoundRoute,
  DefaultRoute
} = ReactRouter;

var routes = (
  <Route name="root" handler={AppBody} path="/">
    <Route name="todoList" path="/lists/:listId" handler={ListShow} />
    <Route name="join" path="/join" handler={AuthJoinPage} />
    <Route name="signin" path="/signin" handler={AuthSignInPage} />
    <DefaultRoute handler={AppLoading} />
    <NotFoundRoute handler={AppNotFound} />
  </Route>
)

var router = ReactRouter.create({
  routes: routes,
  location: ReactRouter.HistoryLocation
});

var showFirstList = function () {
  router.replaceWith("todoList", { listId: Lists.findOne()._id });
}

var subsReady;

// This data is used on every page; also we want to make sure we route to the
// first list instead of no list at all
var handles = [
  Meteor.subscribe("publicLists"),
  Meteor.subscribe("privateLists")
];

Meteor.startup(function () {
  router.run(function (Handler, state) {
    // If we are at the root and our subscriptions are done
    if (state.routes.length > 1 && state.routes[1].isDefault && subsReady) {
      showFirstList();
    }

    React.render(<Handler handles={ handles } />, document.body);
  });
});

// XXX this should be replaced by promises, probably...
Tracker.autorun(function (computation) {
  // Are all of the subscriptions done yet?
  subsReady = _.all(handles, function (handle) {
    return handle.ready();
  });

  // If they are, and we are at the root route, we should go to a valid list
  if (subsReady && router.getRouteAtDepth(1) &&
      router.getRouteAtDepth(1).isDefault) {
    // Workaround for bug in react Meteor package that means we can't run
    // render inside an autorun and then stop the autorun
    Meteor.defer(function () {
      showFirstList();
    });

    computation.stop();
  }
});
