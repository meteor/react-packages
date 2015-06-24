<h1>Using reactive Meteor data inside React components</h1>

Many data sources in Meteor are "reactive" &mdash; that is, they use Meteor's [Tracker](https://www.meteor.com/tracker) library to notify data consumers when something has changed. These data sources include the following:

- [`Meteor.user()`](http://docs.meteor.com/#/full/meteor_user) - the currently logged-in user
- [`Mongo.Collection`](http://docs.meteor.com/#/full/collections) - a persistent collection that can be accessed from the client
- [`ReactiveVar`](http://docs.meteor.com/#/full/reactivevar_pkg) - store a single value reactively
- Many packages on Atmosphere that provide other data, like geolocation

## The ReactMeteorData mixin

In order to make it easy to use these data sources together with React components, we have created a React mixin called `ReactMeteorData`. Once you have added this mixin to your component, you can define a method called `getMeteorData` on your component.

Inside `getMeteorData`, you can access any Meteor reactive data source, as well as `this.props` and `this.state`. `getMeteorData` will reactively rerun when the accessed data changes. `getMeteorData` must return an object, and the properties of the object will be copied onto the component's `this.data`.  To use the data, you access `this.data` from the `render()` method.

Subscriptions that you make from `getMeteorData` using `Meteor.subscribe` will be automatically maintained across reruns of `getMeteorData`, and cleaned up when the component unmounts.  The arguments to a subscription can depend on `this.props` and `this.state`.

### Examples

A simple component that just says hello to the currently logged in user:

```js
var HelloUser = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData() {
    return {
      currentUser: Meteor.user()
    };
  },
  render() {
    return <span>Hello {this.data.currentUser.username}!</span>
  }
});
```

A component that fetches some data based on an ID passed as a prop and passes it down to a child component:

```js
var TodoListLoader = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData() {
    // This is the place to subscribe to any data you need
    var handle = Meteor.subscribe("todoList", this.props.id);

    return {
      todoListLoading: ! handle.ready(), // Use handle to show loading state
      todoList: TodoLists.findOne(this.props.id),
      todoListTasks: Tasks.find({listId: this.props.id}).fetch()
    };
  },
  render() {
    // Show a loading indicator if data is not ready
    if (this.data.todoListLoading) {
      return <LoadingSpinner />;
    }

    // Render a component and pass down the loaded data
    return <TodoList
      list={this.data.todoList}
      tasks={this.data.todoListTasks} />
  }
});
```

### Preventing extra re-renders from new data

React has a handy `shouldComponentUpdate` hook for preventing unnecessary rerenders. That works for `props` and `state` changes, but will not help you prevent a re-render when `this.data` is updated.

If you find that your component is re-rendering too often because of spurious changes in data, you can split it into two components - a wrapper component that just loads the data, and a child that actually renders the view. Then, you can pass `this.data` into the child through `props`, and use `shouldComponentUpdate` in the child to prevent unnecessary re-renders.

## Warning: `render()` is not reactive

If you access a Meteor reactive data source from your component's `render` method, the component will **not** automatically rerender when data changes. If you want your component to rerender with the most up-to-date data, access all reactive functions from inside the `getMeteorData` method.

## Design notes

### Why we decided to ship a mixin

React now supports [defining components in the form of ES6 classes](https://facebook.github.io/react/docs/reusable-components.html#es6-classes), but these classes [do not support mixins](https://facebook.github.io/react/docs/reusable-components.html#no-mixins). In some future version of React, mixins might not be the recommended way for shipping functionality to integrate into React components.

However, after some research and discussion with React developers from different companies, we have found that mixins are currently the best practice. Popular libraries, such as ReactRouter, are [sticking with mixins](https://github.com/rackt/react-router/blob/master/UPGRADE_GUIDE.md#0132---0133) until something better comes along.

Mixins are also the best way of polyfilling [React's proposed standard pattern](https://github.com/facebook/react/issues/3398) for getting reactive data into components. When the `observe` API is shipped in React, or when decorators or mixins are added to JavaScript classes, we will consider switching to those if they provide a better integration.  We expect the community will also experiment with other integrations.

### How the mixin works

The component's `this.data` is initially populated from a `componentDidMount` callback.

When the component recieves new props or state, here's what React does normally:

1. Call `componentWillReceiveProps(nextProps)` (if there are new props)
2. Call `shouldComponentUpdate(nextProps, nextState)` (and maybe stop the update)
3. Call `componentWillUpdate(nextProps, nextState)`
4. Assign `this.props = nextProps` and `this.state = nextState`
5. Call `render()`

React's upcoming `observe` API adds a new step between steps 4 and 5 &mdash; after assigning `this.props` and `this.state`, and before calling `render()` &mdash; in which a method named `observe()` is called, and `this.data` is updated.  To simulate this extra step, the mixin uses a `componentWillUpdate` callback (step 3) that calls `getMeteorState` while temporarily swapping in the new values for `this.props` and `this.state`, putting them right back when it's done.

Note that you can still use all the lifecycle callbacks, including `shouldComponentUpdate`, for their usual purpose.  However, `shouldComponentUpdate` can only be used to stop updates caused by changes to props and state, not data.

Finally, if a Meteor reactive data source changes that was accessed from `getMeteorData`, the mixin calls `forceUpdate()` on the component, which triggers the update steps listed above, leading to `getMeteorData` being called again.
