const {
  Router,
  Route,
  IndexRoute
} = ReactRouter;

const createHistory = ReactRouter.history.createHistory;

const routes = (
  <Route path="/" component={AppBody}>
    <Route path="lists/:listId" component={TodoListPage} />
    <Route path="join" component={AuthJoinPage} />
    <Route path="signin" component={AuthSignInPage} />
    <IndexRoute component={AppLoading} />
    <Route path="*" component={AppNotFound} />
  </Route>
);

const router = (
  <Router history={createHistory()}>
    {routes}
  </Router>);

Meteor.startup(function () {
  ReactDOM.render(router, document.getElementById("app-container"));
});
