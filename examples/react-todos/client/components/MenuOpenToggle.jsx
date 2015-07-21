MenuOpenToggle = React.createClass({
  contextTypes: {
    toggleMenuOpen: React.PropTypes.func.isRequired
  },
  render() {
    return (
      <div className="nav-group">
        <a className="nav-item" onClick={ this.context.toggleMenuOpen } >
          <span className="icon-list-unordered" title="Show menu" />
        </a>
      </div>
    );
  }
});
