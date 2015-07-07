// @jsx React.DOM

TodoItem = React.createClass({
  getInitialState() {
    return {
      focused: false,
      curText: null
    };
  },
  onFocus() {
    this.setState({
      focused: true,
      curText: this.props.task.text
    });
    this.props.onInitiateEdit();
  },
  onBlur() {
    this.setState({ focused: false });
    this.props.onStopEdit();
  },
  onTextChange(event) {
    var curText = event.target.value;
    this.setState({curText: curText});

    // Throttle updates so we don't go to minimongo and then the server
    // on every keystroke.
    this.updateText = this.updateText || _.throttle(newText => {
      Todos.update(this.props.task._id,
                   {$set: {text: newText}});
    }, 300);

    this.updateText(curText);
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
    var className = "list-item";
    if (this.props.beingEdited) {
      className += " editing";
    }
    if (this.props.task.checked) {
      className += " checked";
    }
    return <div className={ className }>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={ this.props.task.checked }
          name="checked"
          onChange={ this.onCheckboxChange } />
        <span className="checkbox-custom" />
      </label>
      <input
        type="text"
        value={this.state.focused ? this.state.curText : this.props.task.text}
        placeholder="Task name"
        onFocus={ this.onFocus }
        onBlur={ this.onBlur }
        onChange={ this.onTextChange } />
      <a className="delete-item"
        onClick={ this.removeThisItem }
        onMouseDown={ this.removeThisItem }>
        <span className="icon-trash" />
      </a>
    </div>
  }
});
