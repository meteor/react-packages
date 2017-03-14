## `react-meteor-data`

This package provides an integration between React and [`tracker`](https://atmospherejs.com/meteor/tracker), Meteor's reactive data system.

### Install

To install the package, use `meteor add`:

```bash
meteor add react-meteor-data
```

You'll also need to install `react` and `react-addons-pure-render-mixin` if you have not already:

```bash
npm install --save react react-addons-pure-render-mixin
```

### Usage

This package exports a symbol `createContainer`, which you can use to create a Higher Order Container to wrap your data using container.

```js
import { createContainer } from 'meteor/react-meteor-data';

export default FooContainer = createContainer(props => {
  // Do all your reactive data access in this method.
  // Note that this subscription will get cleaned up when your component is unmounted
  const handle = Meteor.subscribe('todoList', props.id);

  return {
    currentUser: Meteor.user(),
    listLoading: ! handle.ready(),
    tasks: Tasks.find({ listId: props.id }).fetch(),
  };
}, Foo);
```
The first argument to `createContainer` is a reactive function that will get re-run whenever its reactive inputs change.

The returned component will, when rendered, render the second argument (the "lower-order" component) with its provided `props` in addition to the result of the reactive function. So `Foo` will receive `FooContainer`'s `props` as well as `{currentUser, listLoading, tasks}`.

For more information, see the [React article](http://guide.meteor.com/react.html) in the Meteor Guide.

#### Usage with ReactiveVar

You can use `createContainer` with Meteor's `ReactiveVar`s by providing a `getInitialState` function.

```js
import { createContainer } from 'meteor/react-meteor-data';

export default FooContainer = createContainer({
  getInitialState(props) {
    return {
      loadCount: new ReactiveVar(props.initialLoadCount)
    };
  },
  getMeteorData(props, state) {
    // will resubscribe when loadCount changes
    const { loadCount } = state
    const handle = Meteor.subscribe('todoList', props.id, loadCount.get());

    return {
      loadMore() {
        loadCount.set(loadCount.get() + 5);
      },
      currentUser: Meteor.user(),
      listLoading: ! handle.ready(),
      tasks: Tasks.find({ listId: props.id }).fetch(),
    };
  }
}, Foo);
```
