var Link = ReactRouter.Link;

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

    var showHTML;

    if (self.props.user) {
      var email = self.props.user.emails[0].address;
      var emailUsername = email.substring(0, email.indexOf('@'));

      var arrowDirection = self.state.menuOpen ? "up" : "down";
      var arrowIconClass = "icon-arrow-" + arrowDirection;

      showHTML = ( 
        <div className="btns-group-vertical">
          <a href="#" className="btn-secondary" onClick={ self.toggleMenuOpen }>
            <span className={ arrowIconClass } />
            { emailUsername }
          </a>
          { self.state.menuOpen ?
            <a className="btn-secondary" onClick={ self.logout } >Logout</a> : ""}
        </div>
      );
    } 
    else {
      showHTML = ( 
        <div className="btns-group">
          <Link to="signin" className="btn-secondary">Sign in</Link>
          <Link to="join" className="btn-secondary">Join</Link>
        </div>
      );
    }

    return (
      <div>
        { showHTML }
      </div>
    );
  }
});
