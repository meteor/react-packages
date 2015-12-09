TodoListHeader = React.createClass({
  mixins: [ReactRouter.Navigation],

  propTypes: {
    list: React.PropTypes.object.isRequired,
    tasksLoading: React.PropTypes.bool
  },

  getInitialState() {
    return {
      editingTitle: false,
    };
  },

  startEditingTitle() {
    this.setState({
      editingTitle: true,
      nameInputValue: this.props.list.name
    }, () => {
      ReactDOM.findDOMNode(this.refs.nameInput).focus();
    });
  },

  stopEditingTitle(event) {
    event.preventDefault();

    this.setState({
      editingTitle: false,
      nameInputValue: undefined
    });

    Meteor.call("/lists/updateName",
      this.props.list._id, this.state.nameInputValue);
  },

  titleChanged(event) {
    this.setState({
      nameInputValue: event.target.value
    });
  },

  deleteList() {
    const errorMessages = {
      "not-logged-in": "Please sign in or create an account to make private lists.",
      "final-list-delete": "Sorry, you cannot delete the final public list!",
    };

    const message = `Are you sure you want to delete the list ${this.props.list.name}?`;
    if (confirm(message)) {
      Meteor.call("/lists/delete", this.props.list._id, (err, res) => {
        if (err) {
          alert(errorMessages[err.error]);
          return;
        }

        // Now that this list doesn't exist, redirect to the first list
        this.transitionTo("root");
      })
    }
  },

  toggleListPrivacy() {
    const errorMessages = {
      "not-logged-in": "Please sign in or create an account to make private lists.",
      "final-list-private": "Sorry, you cannot make the final public list private!",
    };

    Meteor.call("/lists/togglePrivate", this.props.list._id, (err, res) => {
      if (err) {
        alert(errorMessages[err.error]);
      }
    });
  },

  onSubmitNewTask(event) {
    event.preventDefault();

    const listId = this.props.list._id;
    const input = ReactDOM.findDOMNode(this.refs.newTaskInput);
    const taskText = input.value;
    if (! taskText) {
      // Don't do anything if the input is empty
      return;
    }

    Meteor.call("/lists/addTask", this.props.list._id, taskText, (err, res) => {
      if (err) {
        alert("Failed to add new task.");
        return;
      }

      input.value = "";
    });
  },

  render() {
    const list = this.props.list;

    const newTaskForm = (
      <form className="todo-new input-symbol"
          onSubmit={ this.onSubmitNewTask }>
        <input type="text" name="text" ref="newTaskInput" placeholder="Type to add new tasks" />
        <span className="icon-add" />
      </form>
    );

    let nav;
    if (this.state.editingTitle) {
      nav = (
        <nav>
          <form className="list-edit-form" onSubmit={ this.stopEditingTitle }>
            <input type="text" name="name"
              ref="nameInput"
              defaultValue={ list.name }
              onChange={ this.titleChanged }
              onBlur={ this.stopEditingTitle } />
            <div className="nav-group right">
              <a className="nav-item">
                <span className="icon-close" title="Cancel" />
              </a>
            </div>
          </form>
          { newTaskForm }
        </nav>
      );
    } else if (list && ! this.props.tasksLoading) {
      nav = (
        <nav>
          <MenuOpenToggle />
          <h1 className="title-page" onClick={ this.startEditingTitle }>
            <span className="title-wrapper">{ list.name }</span>
            <span className="count-list">{ list.incompleteCount }</span>
          </h1>
          <div className="nav-group right">
            <div className="nav-item options-mobile">
              <select className="list-edit">
                <option disabled>Select an action</option>
                { list.userId ?
                  <option value="public">Make Public</option> :
                  <option value="private">Make Private</option> }
                <option value="delete">Delete</option>
              </select>
              <span className="icon-cog"></span>
            </div>
            <div className="options-web">
              <a className="nav-item" onClick={ this.toggleListPrivacy }>
                { list.userId ?
                    <span className="icon-lock" title="Make list public" /> :
                    <span className="icon-unlock" title="Make list private" /> }
              </a>
              <a className="nav-item" onClick={ this.deleteList }>
                <span className="icon-trash" title="Delete list"></span>
              </a>
            </div>
          </div>
          { newTaskForm }
        </nav>
      );
    } else if (list) {
      nav = (
        <nav>
          <div className="wrapper-message">
            <div className="title-message">Loading tasks...</div>
          </div>
        </nav>
      );
    }

    return nav;
  }
});
