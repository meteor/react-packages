<h1>Using reactive Meteor data inside React components</h1>

Many data sources in Meteor are "reactive" - that is, they use Meteor's [Tracker](https://www.meteor.com/tracker) library to notify data consumers when something has changed. These data sources include the following:

- [`Meteor.user()`](http://docs.meteor.com/#/full/meteor_user)
- [`collection.find()`](http://docs.meteor.com/#/full/find) and [`collection.findOne()`](http://docs.meteor.com/#/full/findone)
- [`reactiveVar.get()`](http://docs.meteor.com/#/full/reactivevar_set)
- Many packages on Atmosphere that provide other data, like geolocation

## MeteorDataMixin

In order to make it easy to use these data sources together with React components, we have created a React mixin called `MeteorDataMixin`. Once you have added this mixin to your component, you can define an extra method called `trackMeteorData`. `trackMeteorData` receives your component's `props` and `state` as arguments and can access any reactive state from Meteor. The data the method returns is put on `this.data` so that you can access it from the `render` function.

### Examples

A simple component that just says hello to the currently logged in user:

```js
var HelloUser = React.createClass({
  mixins: [MeteorDataMixin],
  trackMeteorData(props, state) {
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
  mixins: [MeteorDataMixin],
  trackMeteorData(props, state) {
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
