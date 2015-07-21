<h1>Setting up routing with React</h1>

Getting started with Meteor, React, and URL routing is easy. We've found two routers that work great in the React+Meteor environment: React Router and Flow Router.

## Flow Router

Flow Router is a Meteor-specific router which works for a variety of different view layers. Getting started with Flow Router and react is super easy. Check out the [Flow Router docs](https://github.com/meteorhacks/flow-router/blob/master/README.md).

### 1. Add the package

```sh
meteor add meteorhacks:flow-router
```

### 2. Create a route

```js
FlowRouter.route('/blog/:postId', {
  action(params) {
    const containerElement = document.getElementById("app-container");
    React.render(<AppBody postId={params.postId} />, containerElement);
  }
});
```

If you need complex layout options, there is also a companion package called [react-layout](https://github.com/kadirahq/meteor-react-layout).

## React Router

This is a popular Router designed specifically for React, which specializes in rendering nested component trees. Check out the [React Router docs](http://rackt.github.io/react-router/).

### 1. Add the package

See the directions on the [Client NPM packages with Browserify page](client-npm.md).

### 2. Create your routes

Here is some code taken from the React Todos example, which demonstrates how to define several different kinds of routes:

```js
const {
  Route,
  NotFoundRoute,
  DefaultRoute
} = ReactRouter;

const routes = (
  <Route name="root" handler={AppBody} path="/">
    <Route name="todoList" path="/lists/:listId" handler={TodoListPage} />
    <Route name="join" path="/join" handler={AuthJoinPage} />
    <Route name="signin" path="/signin" handler={AuthSignInPage} />
    <DefaultRoute handler={AppLoading} />
    <NotFoundRoute handler={AppNotFound} />
  </Route>
)

const router = ReactRouter.create({
  routes: routes,
  location: ReactRouter.HistoryLocation
});

Meteor.startup(function () {
  router.run(function (Handler, state) {
    React.render(<Handler/>, document.getElementById("app-container"));
  });
});
```
