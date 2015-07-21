AuthErrors = React.createClass({
  propTypes: {
    errors: React.PropTypes.object
  },
  render() {
    if (this.props.errors) {
      return (
        <div className="list-errors">
          {
            _.values(this.props.errors).map(function (errorMessage) {
              return <div key={errorMessage} className="list-item">
                {errorMessage}
              </div>;
            })
          }
        </div>
      );
    } else {
      // Don't render anything
      return <span />
    }
  }
});
