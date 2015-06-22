// @jsx React.DOM

TodoItem = React.createClass({
  componentWillMount() {
    this.throttledOnKeyUp = _.throttle(function (event) {
      Todos.update(this.props.task._id,
        {$set: {text: event.target.value}});
    }, 300);
  },
  onFocus() {
    this.props.onInitiateEdit();
  },
  onBlur() {
    this.props.onStopEdit();
  },
  onKeyUp(event) {
    // This is a weird thing you have to do in React if you want to handle an
    // event asynchronously
    event.persist();
    this.throttledOnKeyUp(event);
  },
  onCheckboxChange() {
    var checked = ! this.props.task.checked;

    Todos.update(this.props.task._id,
      {$set: {checked: checked}});

    Lists.update(this.props.task.listId,
      {$inc: {incompleteCount: checked ? -1 : 1}});
  },
  removeThisItem() {
    Todos.remove(this.props.task._id);

    if (! this.props.task.checked) {
      Lists.update(this.props.task.listId, {$inc: {incompleteCount: -1}});
    }
  },
  render() {
    var self = this;

    var className = "list-item";
    if (self.props.beingEdited) {
      className += " editing";
    }
    if (self.props.task.checked) {
      className += " checked";
    }

    return <div className={ className }>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={ self.props.task.checked }
          name="checked"
          onChange={ self.onCheckboxChange } />
        <span className="checkbox-custom" />
      </label>
      <input
        type="text"
        defaultValue={self.props.task.text}
        placeholder="Task name"
        onFocus={ self.onFocus } 
        onBlur={ self.onBlur }
        onKeyUp={ self.onKeyUp } />
      <a className="delete-item"
        onClick={ self.removeThisItem }
        onMouseDown={ self.removeThisItem }>
        <span className="icon-trash" />
      </a>
    </div>
  }
});