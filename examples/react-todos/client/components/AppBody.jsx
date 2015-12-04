const Link = ReactRouter.Link;


// true if we should show an error dialog when there is a connection error.
// Exists so that we don't show a connection error dialog when the app is just
// starting and hasn't had a chance to connect yet.
const ShowConnectionIssues = new ReactiveVar(false);

const CONNECTION_ISSUE_TIMEOUT = 5000;


// Only show the connection error box if it has been 5 seconds since
// the app started
setTimeout(function () {
  // Show the connection error box
  ShowConnectionIssues.set(true);
}, CONNECTION_ISSUE_TIMEOUT);


// This component handles making the subscriptons to globally necessary data,
// handling router transitions based on that data, and rendering the basic app
// layout
AppBody = React.createClass({
  mixins: [ReactMeteorData],

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
    const subHandles = [
      Meteor.subscribe("publicLists"),
      Meteor.subscribe("privateLists")
    ];

    const subsReady = _.all(subHandles, function (handle) {
      return handle.ready();
    });

    // Get the current routes from React Router
    const routes = this.props.routes;

    // If we are at the root route, and the subscrioptions are ready
    if (routes.length > 1 && !routes[1].path && subsReady) {
      // Redirect to the route for the first todo list
      this.props.history.replaceState(null, `/lists/${Lists.findOne()._id}`);
    }

    return {
      subsReady: subsReady,
      lists: Lists.find({}, { sort: {createdAt: -1} }).fetch(),
      currentUser: Meteor.user(),
      disconnected: ShowConnectionIssues.get() && (! Meteor.status().connected)
    };
  },

  toggleMenuOpen() {
    this.setState({
      menuOpen: ! this.state.menuOpen
    });
  },

  addList() {
    Meteor.call("/lists/add", (err, res) => {
      if (err) {
        // Not going to be too fancy about error handling in this example app
        alert("Error creating list.");
        return;
      }

      // Go to the page for the new list
      this.props.history.pushState(null, `/lists/${res}`);
    });
  },

  getListId() {
    return this.props.params.listId;
  },

  render() {
    let appBodyContainerClass = "";

    if (Meteor.isCordova) {
      appBodyContainerClass += " cordova";
    }

    if (this.state.menuOpen) {
      appBodyContainerClass += " menu-open";
    }

    return (
      <div id="container" className={ appBodyContainerClass }>

        <LeftPanel
          currentUser={this.data.currentUser}
          onAddList={this.addList}
          lists={this.data.lists}
          activeListId={this.getListId()} />

        { this.data.disconnected ? <ConnectionIssueDialog /> : "" }

        <div className="content-overlay" onClick={ this.toggleMenuOpen }></div>

        <div id="content-container">
          { this.data.subsReady ?
            this.props.children :
            <AppLoading /> }
        </div>

      </div>
    );
  }
});
