TodoItem = React.createClass({
  propTypes: {
    task: React.PropTypes.object.isRequired,
    onStopEdit: React.PropTypes.func,
    onInitiateEdit: React.PropTypes.func,
    beingEdited: React.PropTypes.bool
  },

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
    const curText = event.target.value;
    this.setState({curText: curText});

    // Throttle updates so we don't go to minimongo and then the server
    // on every keystroke.
    this.updateText = this.updateText || _.throttle(newText => {
      Meteor.call("/todos/setText", this.props.task._id, newText);
    }, 300);

    this.updateText(curText);
  },

  onCheckboxChange() {
    // Set to the opposite of the current state
    const checked = ! this.props.task.checked;

    Meteor.call("/todos/setChecked", this.props.task._id, checked);
  },

  removeThisItem() {
    Meteor.call("/todos/delete", this.props.task._id);
  },

  render() {
    let className = "list-item";

    if (this.props.beingEdited) {
      className += " editing";
    }

    if (this.props.task.checked) {
      className += " checked";
    }

    return (
      <div className={ className }>
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
    );
  }
});
