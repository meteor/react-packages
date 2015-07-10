var {
  Navigation,
  Link
} = ReactRouter;

AuthJoinPage = React.createClass({
  mixins: [Navigation],
  getInitialState() {
    return {
      errors: {}
    };
  },
  onSubmit(event) {
    event.preventDefault();

    var self = this;

    var email = event.target.email.value;
    var password = event.target.password.value;
    var confirm = event.target.confirm.value;

    var errors = {};

    if (! email) {
      errors.email = 'Email required';
    }

    if (! password) {
      errors.password = 'Password required';
    }

    if (confirm !== password) {
      errors.confirm = 'Please confirm your password';
    }

    self.setState({
      errors: errors
    });

    if (! _.isEmpty(errors)) {
      // Form errors found, do not create user
      return;
    }

    Accounts.createUser({
      email: email,
      password: password
    }, function(error) {
      if (error) {
        self.setState({
          errors: { 'none': error.reason }
        });

        return;
      }

      self.transitionTo('root');
    });
  },
  render() {
    var self = this;

    return <div className="page auth">
      <nav>
        <MenuOpenToggle />
      </nav>
      <div className="content-scrollable">
        <div className="wrapper-auth">
          <h1 className="title-auth">Join.</h1>
          <p className="subtitle-auth" >Joining allows you to make private lists</p>
          <form onSubmit={ self.onSubmit }>
            <AuthErrors errors={self.state.errors} />
            <AuthFormInput hasError={!! self.state.errors.email} type="email" name="email" label="Your Email" iconClass="icon-email" />
            <AuthFormInput hasError={!! self.state.errors.password} type="password" name="password" label="Password" iconClass="icon-lock" />
            <AuthFormInput hasError={!! self.state.errors.confirm} type="password" name="confirm" label="Confirm Password" iconClass="icon-lock" />
            <button type="submit" className="btn-primary">Join Now</button>
          </form>
        </div>
        <Link to="signin" className="link-auth-alt">Have an account? Sign in.</Link>
      </div>
    </div>
  }
});
