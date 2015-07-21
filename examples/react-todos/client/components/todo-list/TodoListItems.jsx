TodoListItems = React.createClass({
  propTypes: {
    tasks: React.PropTypes.array.isRequired
  },

  getInitialState() {
    return {
      taskBeingEditedId: null,
    };
  },

  setTaskBeingEdited(taskId) {
    this.setState({
      taskBeingEditedId: taskId
    });
  },

  render() {
    var allTodoItems = this.props.tasks.map((task) => {
      return (
        <TodoItem
          key={ task._id }
          task={ task }
          beingEdited={ task._id === this.state.taskBeingEditedId }
          onInitiateEdit={ this.setTaskBeingEdited.bind(this, task._id) }
          onStopEdit={ this.setTaskBeingEdited.bind(this, null) } />
      );
    });

    return (
      <div className="content-scrollable list-items">
        { allTodoItems }
      </div>
    );
  }
});