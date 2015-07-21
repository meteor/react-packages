LeftPanel = React.createClass({
  render() {
    return (
      <section id="menu">
        <UserSidebarSection user={ this.props.currentUser } />
        <div className="list-todos">
          <a className="link-list-new" onClick={ this.props.addList }>
            <span className="icon-plus"></span>
            New List
          </a>
        
          <ListTodos lists={this.props.lists} getListId={this.props.getListId} />

        </div>
      </section>
    );
  }
});