LeftPanel = React.createClass({
   render() {
      var self = this;

      return (
        <section id="menu">
          <UserSidebarSection user={ self.props.currentUser } />
          <div className="list-todos">
            <a className="link-list-new" onClick={ self.props.addList }>
              <span className="icon-plus"></span>
              New List
            </a>
          
            <ListTodos lists={self.props.lists} getListId={self.props.getListId} />

          </div>
        </section>
      );
  }
});