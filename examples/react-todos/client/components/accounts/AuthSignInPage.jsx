const {
  Navigation,
  Link
} = ReactRouter;

AuthSignInPage = React.createClass({
  mixins: [Navigation],
  getInitialState() {
    return {
      errors: {}
    };
  },
  onSubmit(event) {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;

    const errors = {};

    if (! email) {
      errors.email = 'Email required';
    }

    if (! password) {
      errors.password = 'Password required';
    }

    this.setState({
      errors: errors
    });

    if (! _.isEmpty(errors)) {
      // Form errors found, do not log in
      return;
    }

    Meteor.loginWithPassword(email, password, (error) => {
      if (error) {
        this.setState({
          errors: { 'none': error.reason }
        });

        return;
      }

      this.transitionTo('root');
    });
  },
  render() {
    return <div className="page auth">
      <nav>
        <MenuOpenToggle />
      </nav>

      <div className="content-scrollable">
        <div className="wrapper-auth">
          <h1 className="title-auth">Sign In.</h1>
          <p className="subtitle-auth" >
            Signing in allows you to view private lists
          </p>

          <form onSubmit={ this.onSubmit }>
            <AuthErrors errors={this.state.errors} />

            <AuthFormInput
              hasError={!! this.state.errors.email}
              type="email"
              name="email"
              label="Your Email"
              iconClass="icon-email" />

            <AuthFormInput hasError={!! this.state.errors.password}
              type="password"
              name="password"
              label="Password"
              iconClass="icon-lock" />

            <button type="submit" className="btn-primary">
              Sign in
            </button>
          </form>
        </div>
        <Link to="join" className="link-auth-alt">
          Need an account? Join Now.
        </Link>
      </div>
    </div>
  }
});
