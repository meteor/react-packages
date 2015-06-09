// @jsx React.DOM

var {
  Link,
  Navigation,
  State,
  RouteHandler
} = ReactRouter;

UserSidebarSection = React.createClass({
  getInitialState() {
    return {
      menuOpen: false
    };
  },
  propTypes: {
    user: React.PropTypes.object
  },
  toggleMenuOpen(event) {
    event.preventDefault();

    this.setState({
      menuOpen: ! this.state.menuOpen
    });
  },
  logout() {
    Meteor.logout();
  },
  render() {
    var self = this;

    if (self.props.user) {
      var email = self.props.user.emails[0].address;
      var emailUsername = email.substring(0, email.indexOf('@'));

      var arrowDirection = self.state.menuOpen ? "up" : "down";
      var arrowIconClass = "icon-arrow-" + arrowDirection;

      return <div className="btns-group-vertical">
        <a href="#" className="btn-secondary">
          <span className={ arrowIconClass } onClick={ self.toggleMenuOpen } />
          { emailUsername }
        </a>
        { self.state.menuOpen ?
          <a className="btn-secondary" onClick={ self.logout } >Logout</a> : ""}
      </div>
    } else {
      return <div className="btns-group">
        <Link to="signin" className="btn-secondary">Sign in</Link>
        <Link to="join" className="btn-secondary">Join</Link>
      </div>
    }
  }
});

AppBody = React.createClass({
  mixins: [MeteorDataMixin, Navigation, State],
  propTypes: {
    handles: React.PropTypes.array.isRequired,
    listId: React.PropTypes.string
  },
  getInitialState() {
    return {
      lists: []
    };
  },
  trackMeteorData(props, state) {
    var subsReady = _.all(props.handles, function (handle) {
      return handle.ready();
    });

    return {
      subsReady: subsReady,
      lists: Lists.find().fetch(),
      currentUser: Meteor.user()
    };
  },
  addList() {
    var list = {
      name: Lists.defaultName(),
      incompleteCount: 0
    };

    var listId = Lists.insert(list);

    this.transitionTo('todoList', { listId: listId });
  },
  getListId() {
    return this.getParams().listId;
  },
  render() {
    var self = this;

    return <div id="container">
      <section id="menu">
        <UserSidebarSection user={ self.data.currentUser } />
        <div className="list-todos">
          <a className="link-list-new" onClick={ self.addList }>
            <span className="icon-plus"></span>
            New List
          </a>
          { self.data.lists.map(function (list) {

            var className = "list-todo";
            if (self.getListId() === list._id) {
              className += " active";
            }

            return <Link
              className={ className }
              key={ list._id }
              to="todoList" 
              params={{ listId: list._id }}>
                { list.name }
                { list.incompleteCount ?
                  <span className="count-list">
                    { list.incompleteCount }
                  </span> : "" }
            </Link>
          }) }
        </div>
      </section>
      <div className="content-overlay"></div>
      <div id="content-container">
        <RouteHandler />
      </div>
    </div>
  }
});