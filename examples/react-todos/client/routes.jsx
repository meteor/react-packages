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

Meteor.startup(function () {
  router.run(function (Handler, state) {
    React.render(<Handler/>, document.body);
  });
});
