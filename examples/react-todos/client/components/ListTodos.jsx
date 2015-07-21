var Link = ReactRouter.Link;

ListTodos = React.createClass({
  render() {
    var showTodoList = this.props.lists.map((list) => {
      var className = "list-todo";
      if (this.props.getListId() === list._id) {
        className += " active";
      }

      return (
        <Link
          className={ className }
          key={ list._id }
          to="todoList"
          params={{ listId: list._id }}>
            { list.name }
            { list.incompleteCount ?
              <span className="count-list">
                { list.incompleteCount }
              </span> : "" }
        </Link>
      );
    });

    return (
      <div>
        { showTodoList }  
      </div>
    );
  }
});