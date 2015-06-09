// @jsx React.DOM

var Navigation = ReactRouter.Navigation;

ListShow = React.createClass({
  mixins: [MeteorDataMixin, Navigation],
  getInitialState: function () {
    return {
      tasks: [],
      taskBeingEditedId: null,
      editingTitle: false
    };
  },
  startMeteorSubscriptions: function () {
    var self = this;
    
  },
  trackMeteorData: function (props, state) {
    var self = this;

    var listId = props.listId;
    Meteor.subscribe("todos", listId);

    return {
      tasks: Todos.find({ listId: listId }, {sort: {createdAt : -1}}).fetch(),
      list: Lists.findOne({ _id: listId })
    };
  },
  setTaskBeingEdited: function (taskId) {
    this.setState({
      taskBeingEditedId: taskId
    });
  },
  startEditingTitle: function () {
    var self = this;

    self.setState({
      editingTitle: true,
      nameInputValue: self.state.list.name
    }, function () {
      React.findDOMNode(self.refs.nameInput).focus();
    });
  },
  titleChanged: function (event) {
    this.setState({
      nameInputValue: event.target.value
    });
  },
  stopEditingTitle: function () {
    this.setState({
      editingTitle: false,
      nameInputValue: undefined
    });

    Lists.update(this.data.list._id, {
      $set: { name: this.state.nameInputValue }
    });
  },
  toggleListPrivacy: function () {
    var list = this.data.list;

    if (! Meteor.user()) {
      return alert("Please sign in or create an account to make private lists.");
    }

    if (list.userId) {
      Lists.update(list._id, {$unset: {userId: true}});
    } else {
      // ensure the last public list cannot be made private
      if (Lists.find({userId: {$exists: false}}).count() === 1) {
        return alert("Sorry, you cannot make the final public list private!");
      }

      Lists.update(list._id, {$set: {userId: Meteor.userId()}});
    }
  },
  deleteList: function () {
    var list = this.data.list;

    // ensure the last public list cannot be deleted.
    if (! list.userId && Lists.find({userId: {$exists: false}}).count() === 1) {
      return alert("Sorry, you cannot delete the final public list!");
    }
    
    var message = "Are you sure you want to delete the list " + list.name + "?";

    if (confirm(message)) {
      // we must remove each item individually from the client
      Todos.find({listId: list._id}).forEach(function(todo) {
        Todos.remove(todo._id);
      });
      Lists.remove(list._id);

      this.transitionTo("root");
    }
  },
  onSubmitNewTask: function (event) {
    event.preventDefault();

    var listId = this.data.list._id;

    var input = event.target.text;
    if (! input.value) {
      return;
    }
    
    Todos.insert({
      listId: listId,
      text: input.value,
      checked: false,
      createdAt: new Date()
    });

    Lists.update(listId, {$inc: {incompleteCount: 1}});

    input.value = "";
  },
  render: function () {
    var self = this;
    var list = self.data.list;

    var newTaskForm = <form className="todo-new input-symbol"
        onSubmit={ self.onSubmitNewTask }>
      <input type="text" name="text" placeholder="Type to add new tasks" />
      <span className="icon-add" />
    </form>

    var nav;
    if (self.state.editingTitle) {
      nav = <nav>
        <form className="list-edit-form" onSubmit={ self.stopEditingTitle }>
          <input type="text" name="name"
            ref="nameInput"
            defaultValue={ list.name }
            onKeyUp={ self.titleChanged }
            onBlur={ self.stopEditingTitle } />
          <div className="nav-group right">
            <a className="nav-item">
              <span className="icon-close" title="Cancel" />
            </a>
          </div>
        </form>
        { newTaskForm }
      </nav>
    } else if (list) {
      nav = <nav>
        <div className="nav-group">
          <a className="nav-item">
            <span className="icon-list-unordered" title="Show menu" />
          </a>
        </div>
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
    } else {
      nav = <nav>
        <div className="wrapper-message">
          <div className="title-message">Loading tasks...</div>
        </div>
      </nav>
    }

    return <div className="page lists-show">
      { nav }
      <div className="content-scrollable list-items">
        { self.data.tasks.map(function (task) {
          return <TodoItem
            key={ task._id }
            task={ task }
            beingEdited={ task._id === self.state.taskBeingEditedId }
            onInitiateEdit={ self.setTaskBeingEdited.bind(self, task._id) }
            onStopEdit={ self.setTaskBeingEdited.bind(self, null) }
          />
        }) }
      </div>
    </div>
  }
});