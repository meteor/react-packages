var {
  Navigation,
  State
} = ReactRouter;

ListShow = React.createClass({
  mixins: [ReactMeteorData, Navigation, State],
  getInitialState() {
    return {
      taskBeingEditedId: null,
      editingTitle: false
    };
  },

  getMeteorData() {
    var self = this;

    // Get list ID from ReactRouter
    var listId = self.getParams().listId;

    // Subscribe to the tasks we need to render this component
    var tasksSubHandle = Meteor.subscribe("todos", listId);

    return {
      tasks: Todos.find({ listId: listId }, {sort: {createdAt : -1}}).fetch(),
      list: Lists.findOne({ _id: listId }),
      tasksLoading: ! tasksSubHandle.ready()
    };
  },

  setTaskBeingEdited(taskId) {
    this.setState({
      taskBeingEditedId: taskId
    });
  },

  startEditingTitle() {
    var self = this;

    self.setState({
      editingTitle: true,
      nameInputValue: self.data.list.name
    }, function () {
      React.findDOMNode(self.refs.nameInput).focus();
    });
  },

  titleChanged(event) {
    this.setState({
      nameInputValue: event.target.value
    });
  },

  stopEditingTitle(event) {
    event.preventDefault();

    this.setState({
      editingTitle: false,
      nameInputValue: undefined
    });

    Meteor.call("/lists/updateName",
      this.data.list._id, this.state.nameInputValue)
  },

  toggleListPrivacy() {
    var errorMessages = {
      "not-logged-in": "Please sign in or create an account to make private lists.",
      "final-list-private": "Sorry, you cannot make the final public list private!",
    };

    Meteor.call("/lists/togglePrivate", this.data.list._id, (err, res) => {
      if (err) {
        alert(errorMessages[err.error]);
      }
    });
  },

  deleteList() {
    var errorMessages = {
      "not-logged-in": "Please sign in or create an account to make private lists.",
      "final-list-delete": "Sorry, you cannot delete the final public list!",
    };

    var message = `Are you sure you want to delete the list ${this.data.list.name}?`;
    if (confirm(message)) {
      Meteor.call("/lists/delete", this.data.list._id, (err, res) => {
        if (err) {
          alert(errorMessages[err.error]);
          return;
        }

        // Now that this list doesn't exist, redirect to the first list
        this.transitionTo("root");
      })
    }
  },

  onSubmitNewTask(event) {
    event.preventDefault();

    var listId = this.data.list._id;

    var taskText = event.target.text;
    if (! taskText) {
      // Don't do anything if the input is empty
      return;
    }

    Meteor.call("/lists/addTask", this.data.list._id, taskText, (err, res) => {
      if (err) {
        alert("Failed to add new task.");
        return;
      }

      input.value = "";
    });
  },

  render() {
    var self = this;
    var list = self.data.list;
    var tasks = self.data.tasks;

    if (! list) {
      return <AppNotFound />;
    }

    var newTaskForm = (
      <form className="todo-new input-symbol"
          onSubmit={ self.onSubmitNewTask }>
        <input type="text" name="text" placeholder="Type to add new tasks" />
        <span className="icon-add" />
      </form>
    );

    var nav;
    if (self.state.editingTitle) {
      nav = (
        <nav>
          <form className="list-edit-form" onSubmit={ self.stopEditingTitle }>
            <input type="text" name="name"
              ref="nameInput"
              defaultValue={ list.name }
              onChange={ self.titleChanged }
              onBlur={ self.stopEditingTitle } />
            <div className="nav-group right">
              <a className="nav-item">
                <span className="icon-close" title="Cancel" />
              </a>
            </div>
          </form>
          { newTaskForm }
        </nav>
      );
    } else if (list && ! self.data.tasksLoading) {
      nav = (
        <nav>
          <MenuOpenToggle />
          <h1 className="title-page" onClick={ self.startEditingTitle }>
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
              <a className="nav-item" onClick={ self.toggleListPrivacy }>
                { list.userId ?
                    <span className="icon-lock" title="Make list public" /> :
                    <span className="icon-unlock" title="Make list private" /> }
              </a>
              <a className="nav-item" onClick={ self.deleteList }>
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

    var showTodoItemHTML = self.data.tasks.map(function (task) {
      return (
        <TodoItem
          key={ task._id }
          task={ task }
          beingEdited={ task._id === self.state.taskBeingEditedId }
          onInitiateEdit={ self.setTaskBeingEdited.bind(self, task._id) }
          onStopEdit={ self.setTaskBeingEdited.bind(self, null) } />
      );
      });

    return (
      <div className="page lists-show">
        { nav }
        <div className="content-scrollable list-items">
          { showTodoItemHTML }
        </div>
      </div>
    );
  }
});
