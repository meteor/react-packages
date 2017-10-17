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

This package exports a symbol `withTracker`, which you can use to wrap your components with data returned from Tracker reactive functions.

```js
import { withTracker } from 'meteor/react-meteor-data';

// React component
function Foo({ currentUser, listLoading, tasks }) {
  // ...
}

export default withTracker(props => {
  // Do all your reactive data access in this method.
  // Note that this subscription will get cleaned up when your component is unmounted
  const handle = Meteor.subscribe('todoList', props.id);

  return {
    currentUser: Meteor.user(),
    listLoading: !handle.ready(),
    tasks: Tasks.find({ listId: props.id }).fetch(),
  };
})(Foo);
```
The first argument to `withTracker` is a reactive function that will get re-run whenever its reactive inputs change.

The returned component will, when rendered, render `Foo` (the "lower-order" component) with its provided `props` in addition to the result of the reactive function. So `Foo` will receive `FooContainer`'s `props` as well as `{currentUser, listLoading, tasks}`.

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
