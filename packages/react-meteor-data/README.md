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

### Usage

This package provides two ways to use Tracker reactive data in your React components:
- a hook: `useTracker`,
- a higher-order component (HOC): `withTracker`.

The `useTracker` hook, introduced in recent versions of `react-meteor-data`, is slightly more straightforward to use (lets you access reactive data sources directly within your compnenent, rather than adding them from an external wrapper), and slightly more performant (avoids adding wrapper layers in the React tree). But, like all React hooks, it can only be used in function components, not in class components.  
The `withTracker` HOC can be used with all components, function or class.

It is not necessary to rewrite existing applications to use the `useTracker` hook instead of the existing `withTracker` HOC. But for new components, it is suggested to prefer the `useTracker` hook when dealing with function components.

#### `useTracker(reactiveFn, deps)` hook

You can use the `useTracker` hook to get the value of a Tracker reactive function in your (function) components. The reactive function will get re-run whenever its reactive inputs change, and the component will re-render with the new value.

Arguments:
- `reactiveFn`: a Tracker reactive function (with no parameters)
- `deps`: an array of "dependencies" of the reactive function, i.e. the list of values that, when changed, need to stop the current Tracker computation and start a new one - for example, the value of a prop used in a subscription or a Minimongo query; see example below. This array typically includes all variables from the outer scope "captured" in the closure passed as the 1st argument. This is very similar to how the `deps` argument for [React's built-in `useEffect`, `useCallback` or `useMemo` hooks](https://reactjs.org/docs/hooks-reference.html) work.
If omitted, it defaults to `[]` (no dependency), and the Tracker computation will run unchanged until the component is unmounted.

```js
import { useTracker } from 'meteor/react-meteor-data';

// React function component.
function Foo({ listId }) {
  // This computation uses no value from the outer scope,
  // and thus does not needs to pass a 'deps' argument (same as passing []).
  const currentUser = useTracker(() => Meteor.user());
  // The following two computations both depend on the 'listId' prop,
  // and thus need to specify it in the 'deps' argument,
  // in order to subscribe to the expected 'todoList' subscription
  // or fetch the expected Tasks when the 'listId' prop changes.
  const listLoading = useTracker(() => {
    // Note that this subscription will get cleaned up when your component is unmounted.
    const handle = Meteor.subscribe('todoList', listId);
    return !handle.ready();
  }, [listId]);
  const tasks = useTracker(() => Tasks.find({ listId }).fetch(), [listId]);

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
```

Note : the [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) package provides ESLint hints to help detect missing values in the `deps` argument of React built-in hooks. It can be configured with `options: [{additionalHooks: 'useTracker|useSomeOtherHook|...'}]` to also validate the `deps` argument of the `useTracker` hook or some other hooks.

#### `withTracker` higher-prder component

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

### Note on `withTracker` and `createContainer`

The new `withTracker` function replaces `createContainer` (however it remains for backwards compatibility). For `createContainer` usage, please [see prior documentation](https://github.com/meteor/react-packages/blob/ac251a6d6c2d0ddc22daad36a7484ef04b11862e/packages/react-meteor-data/README.md). The purpose of the new function is to better allow for container composability. For example when combining Meteor data with Redux and GraphQL: 

```js
const FooWithAllTheThings = compose(
  connect(...), // some Redux
  graphql(...), // some GraphQL
  withTracker(...), // some Tracker data
)(Foo);
```
