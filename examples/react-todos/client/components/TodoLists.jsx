const Link = ReactRouter.Link;

TodoLists = React.createClass({
  propTypes: {
    lists: React.PropTypes.array.isRequired,
    activeListId: React.PropTypes.string
  },

  render() {
    const allTodoLists = this.props.lists.map((list) => {
      let className = "list-todo";
      if (this.props.activeListId === list._id) {
        className += " active";
      }

      return (
        <Link
          className={ className }
          key={ list._id }
          to={`/lists/${list._id}`}>
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
        { allTodoLists }
      </div>
    );
  }
});
