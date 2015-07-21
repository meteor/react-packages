LeftPanel = React.createClass({
  propTypes: {
    currentUser: React.PropTypes.object,
    onAddList: React.PropTypes.func,
    lists: React.PropTypes.array.isRequired,
    activeListId: React.PropTypes.string,
  },
  render() {
    return (
      <section id="menu">
        <UserSidebarSection user={ this.props.currentUser } />
        <div className="list-todos">
          <a className="link-list-new" onClick={ this.props.onAddList }>
            <span className="icon-plus"></span>
            New List
          </a>
        
          <TodoLists
            lists={this.props.lists}
            activeListId={this.props.activeListId} />
        </div>
      </section>
    );
  }
});