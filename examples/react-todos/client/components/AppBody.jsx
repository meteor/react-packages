var {
  Link,
  Navigation,
  State,
  RouteHandler
} = ReactRouter;

// true if we should show an error dialog when there is a connection error.
// Exists so that we don't show a connection error dialog when the app is just
// starting and hasn't had a chance to connect yet.
var ShowConnectionIssues = new ReactiveVar(false);

var CONNECTION_ISSUE_TIMEOUT = 5000;

// Only show the connection error box if it has been 5 seconds since
// the app started
setTimeout(function () {
  // Show the connection error box
  ShowConnectionIssues.set(true);
}, CONNECTION_ISSUE_TIMEOUT);

AppBody = React.createClass({
  mixins: [ReactMeteorData, Navigation, State],
  propTypes: {
    handles: React.PropTypes.array.isRequired,
  },
  getInitialState() {
    return {
      menuOpen: false
    };
  },
  childContextTypes: {
    toggleMenuOpen: React.PropTypes.func.isRequired
  },
  getChildContext() {
    return {
      toggleMenuOpen: this.toggleMenuOpen
    }
  },
  getMeteorData() {
    var subsReady = _.all(this.props.handles, function (handle) {
      return handle.ready();
    });

    return {
      subsReady: subsReady,
      lists: Lists.find().fetch(),
      currentUser: Meteor.user(),
      disconnected: ShowConnectionIssues.get() && (! Meteor.status().connected)
    };
  },
  toggleMenuOpen() {
    console.log("hello");
    this.setState({
      menuOpen: ! this.state.menuOpen
    });
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

    var appBodyContainerClass = "";

    if (Meteor.isCordova) {
      appBodyContainerClass += " cordova";
    }

    if (self.state.menuOpen) {
      appBodyContainerClass += " menu-open";
    }

    return <div id="container" className={ appBodyContainerClass }>
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
      { self.data.disconnected ? <ConnectionIssueDialog /> : "" }
      <div className="content-overlay" onClick={ self.toggleMenuOpen }></div>
      <div id="content-container">
        { self.data.subsReady ?
          <RouteHandler /> :
          <AppLoading /> }
      </div>
    </div>
  }
});
