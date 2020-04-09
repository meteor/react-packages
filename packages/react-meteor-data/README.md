## `react-meteor-data`

This package provides an integration between React and [`Tracker`](https://atmospherejs.com/meteor/tracker), Meteor's reactive data system.

### Install

To install the package, use `meteor add`:

```bash
meteor add react-meteor-data
```

You'll also need to install `react` if you have not already:

```bash
npm install --save react
```

[check recent changes here](./CHANGELOG.md)

### Usage

This package provides two ways to use Tracker reactive data in your React components:
- a hook: `useTracker` (v2 only, requires React `^16.8`)
- a higher-order component (HOC): `withTracker` (v1 and v2).

The `useTracker` hook, introduced in version 2.0.0, embraces the [benefits of hooks](https://reactjs.org/docs/hooks-faq.html). Like all React hooks, it can only be used in function components, not in class components.

The `withTracker` HOC can be used with all components, function or class based.

It is not necessary to rewrite existing applications to use the `useTracker` hook instead of the existing `withTracker` HOC.

#### `useTracker(reactiveFn, deps)` hook

You can use the `useTracker` hook to get the value of a Tracker reactive function in your (function) components. The reactive function will get re-run whenever its reactive inputs change, and the component will re-render with the new value.

Arguments:
- `reactiveFn`: A Tracker reactive function (receives the current computation).
- `deps`: An optional array of "dependencies" of the reactive function. This is very similar to how the `deps` argument for [React's built-in `useEffect`, `useCallback` or `useMemo` hooks](https://reactjs.org/docs/hooks-reference.html) work. If omitted, the Tracker computation will be recreated on every render (Note: `withTracker` has always done this). If provided, the computation will be retained, and reactive updates after the first run will run asynchronously from the react render cycle. This array typically includes all variables from the outer scope "captured" in the closure passed as the 1st argument. For example, the value of a prop used in a subscription or a Minimongo query; see example below.

```js
import { useTracker } from 'meteor/react-meteor-data';

// React function component.
function Foo({ listId }) {
  // This computation uses no value from the outer scope,
  // and thus does not needs to pass a 'deps' argument.
  // However, we can optimize the use of the computation
  // by providing an empty deps array. With it, the
  // computation will be retained instead of torn down and
  // rebuilt on every render. useTracker will produce the
  // same results either way.
  const currentUser = useTracker(() => Meteor.user(), []);

  // The following two computations both depend on the
  // listId prop. When deps are specified, the computation
  // will be retained.
  const listLoading = useTracker(() => {
    // Note that this subscription will get cleaned up
    // when your component is unmounted or deps change.
    const handle = Meteor.subscribe('todoList', listId);
    return !handle.ready();
  }, [listId]);
  const tasks = useTracker(() => Tasks.find({ listId }).fetch(), [listId]);

  return (
    <h1>Hello {currentUser.username}</h1>
    {listLoading ? (
        <div>Loading</div>
      ) : (
        <div>
          Here is the Todo list {listId}:
          <ul>
            {tasks.map(task => (
              <li key={task._id}>{task.label}</li>
            ))}
          </ul>
        </div>
      )}
  );
}
```

**Note:** the [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) package provides ESLint hints to help detect missing values in the `deps` argument of React built-in hooks. It can be configured to also validate the `deps` argument of the `useTracker` hook or some other hooks, with the following `eslintrc` config:

```
"react-hooks/exhaustive-deps": ["warn", { "additionalHooks": "useTracker|useSomeOtherHook|..." }]
```

#### `withTracker(reactiveFn)` higher-order component

You can use the `withTracker` HOC to wrap your components and pass them additional props values from a Tracker reactive function. The reactive function will get re-run whenever its reactive inputs change, and the wrapped component will re-render with the new values for the additional props.

Arguments:
- `reactiveFn`: a Tracker reactive function, getting the props as a parameter, and returning an object of additional props to pass to the wrapped component.

```js
import { withTracker } from 'meteor/react-meteor-data';

// React component (function or class).
function Foo({ listId, currentUser, listLoading, tasks }) {
  return (
    <h1>Hello {currentUser.username}</h1>
    {listLoading ?
      <div>Loading</div> :
      <div>
        Here is the Todo list {listId}:
        <ul>{tasks.map(task => <li key={task._id}>{task.label}</li>)}</ul>
      </div}
  );
}

export default withTracker(({ listId }) => {
  // Do all your reactive data access in this function.
  // Note that this subscription will get cleaned up when your component is unmounted
  const handle = Meteor.subscribe('todoList', listId);

  return {
    currentUser: Meteor.user(),
    listLoading: !handle.ready(),
    tasks: Tasks.find({ listId }).fetch(),
  };
})(Foo);
```

The returned component will, when rendered, render `Foo` (the "lower-order" component) with its provided props in addition to the result of the reactive function. So `Foo` will receive `{ listId }` (provided by its parent) as well as `{ currentUser, listLoading, tasks }` (added by the `withTracker` HOC).

For more information, see the [React article](http://guide.meteor.com/react.html) in the Meteor Guide.

### Concurrent Mode, Suspense and Error Boundaries

There are some additional considerations to keep in mind when using Concurrent Mode, Suspense and Error Boundaries, as each of these can cause React to cancel and discard (toss) a render, including the result of the first run of your reactive function. One of the things React developers often stress is that we should not create "side-effects" directly in the render method or in functional components. There are a number of good reasons for this, including allowing the React runtime to cancel renders. Limiting the use of side-effects allows features such as concurrent mode, suspense and error boundaries to work deterministically, without leaking memory or creating rogue processes. Care should be taken to avoid side effects in your reactive function for these reasons. (Note: this caution does not apply to Meteor specific side-effects like subscriptions, since those will be automatically cleaned up when `useTracker`'s computation is disposed.)

Ideally, side-effects such as creating a Meteor computation would be done in `useEffect`. However, this is problematic for Meteor, which mixes an initial data query with setting up the computation to watch those data sources all in one initial run. If we wait to do that in `useEffect`, we'll end up rendering a minimum of 2 times (and using hacks for the first one) for every component which uses `useTracker` or `withTracker`, or not running at all in the initial render and still requiring a minimum of 2 renders, and complicating the API.

To work around this and keep things running fast, we are creating the computation in the render method directly, and doing a number of checks later in `useEffect` to make sure we keep that computation fresh and everything up to date, while also making sure to clean things up if we detect the render has been tossed. For the most part, this should all be transparent.

The important thing to understand is that your reactive function can be initially called more than once for a single render, because sometimes the work will be tossed. Additionally, `useTracker` will not call your reactive function reactively until the render is committed (until `useEffect` runs). If you have a particularly fast changing data source, this is worth understanding. With this very short possible suspension, there are checks in place to make sure the eventual result is always up to date with the current state of the reactive function. Once the render is "committed", and the component mounted, the computation is kept running, and everything will run as expected.

### Version compatibility notes

- `react-meteor-data` v2.x :
  - `useTracker` hook + `withTracker` HOC
  - Requires React `^16.8`.
  - Implementation is compatible with "React Suspense", concurrent mode and error boundaries.
  - The `withTracker` HOC is strictly backwards-compatible with the one provided in v1.x, the major version number is only motivated by the bump of React version requirement. Provided a compatible React version, existing Meteor apps leveraging the `withTracker` HOC can freely upgrade from v1.x to v2.x, and gain compatibility with future React versions.
  - The previously deprecated `createContainer` has been removed.

- `react-meteor-data` v0.x :
  - `withTracker` HOC (+ `createContainer`, kept for backwards compatibility with early v0.x releases)
  - Requires React `^15.3` or `^16.0`.
  - Implementation relies on React lifecycle methods (`componentWillMount` / `componentWillUpdate`) that are [marked for deprecation in future React versions](https://reactjs.org/blog/2018/03/29/react-v-16-3.html#component-lifecycle-changes) ("React Suspense").
