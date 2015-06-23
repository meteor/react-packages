<h1>Using reactive Meteor data inside React components</h1>

Many data sources in Meteor are "reactive" - that is, they use Meteor's [Tracker](https://www.meteor.com/tracker) library to notify data consumers when something has changed. These data sources include the following:

- [`Meteor.user()`](http://docs.meteor.com/#/full/meteor_user) - the currently logged-in user
- [`Mongo.Collection`](http://docs.meteor.com/#/full/collections) - a persistent collection that can be accessed from the client
- [`ReactiveVar`](http://docs.meteor.com/#/full/reactivevar_pkg) - store a single value reactively
- Many packages on Atmosphere that provide other data, like geolocation

## ReactMeteorData

In order to make it easy to use these data sources together with React components, we have created a React mixin called `ReactMeteorData`. Once you have added this mixin to your component, you can define an extra method called `getMeteorData`. `getMeteorData` receives your component's `props` and `state` as arguments and can access any reactive state from Meteor. The data the method returns is put on `this.data` so that you can access it from the `render` function.

Note:  You may not access `this.props` or `this.state` from `getMeteorData`.  You must use the arguments `props` and `state`, or you will get incorrect behavior.  This is a consequence of how React's lifecycle hooks work.

### Examples

A simple component that just says hello to the currently logged in user:

```js
var HelloUser = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(props, state) {
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
  getMeteorData(props, state) {
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

## Design notes: Why we decided to ship a mixin

React now supports [defining components in the form of ES6 classes](https://facebook.github.io/react/docs/reusable-components.html#es6-classes), but these classes [do not support mixins](https://facebook.github.io/react/docs/reusable-components.html#no-mixins). In some future version of React, mixins might not be the recommended way for shipping functionality to integrate into React components.

However, after some research and discussion with React developers from different companies, we have found that mixins are currently the best practice. Popular libraries, such as ReactRouter, are [sticking with mixins](https://github.com/rackt/react-router/blob/master/UPGRADE_GUIDE.md#0132---0133) until something better comes along.

Mixins are also the best way of polyfilling [React's proposed standard pattern](https://github.com/facebook/react/issues/3398) for getting reactive data into components. When the `observe` API is shopped in React, or when decorators or mixins are added to JavaScript classes, we will consider switching to those if they provide a better integration.

