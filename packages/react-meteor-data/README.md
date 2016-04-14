## ReactMeteorData

This mixin is a convenient way to use data from a Meteor reactive data source in a React component, with automatic updates when the data changes.

For example:

```
Foo = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData() {
    // do all your reactive data access in this method.
    // you can also use Meteor.subscribe here.
    var handle = Meteor.subscribe("todoList", this.props.id);

    return {
      foo: Session.get('foo'),
      currentUser: Meteor.user(),
      listLoading: ! handle.ready(),
      tasks: Tasks.find({listId: this.props.id}).fetch()
    };
  },
  render() {
    return <div>
      <span>{this.data.foo}</span>
      // ...
    </div>;
  }
});
```

For more information, see the [React article](http://guide.meteor.com/react.html) in the Meteor Guide.
