TodoListPage = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData() {
    // Get list ID from ReactRouter
    const listId = this.props.params.listId;

    // Subscribe to the tasks we need to render this component
    const tasksSubHandle = Meteor.subscribe("todos", listId);

    return {
      tasks: Todos.find({ listId: listId }, {sort: {createdAt : -1}}).fetch(),
      list: Lists.findOne({ _id: listId }),
      tasksLoading: ! tasksSubHandle.ready()
    };
  },

  render() {
    const list = this.data.list;
    const tasks = this.data.tasks;

    if (! list) {
      return <AppNotFound />;
    }

    return (
      <div className="page lists-show">
        <TodoListHeader
          list={list}
          showLoadingIndicator={this.data.tasksLoading} />

        <TodoListItems tasks={this.data.tasks} />
      </div>
    );
  }
});
