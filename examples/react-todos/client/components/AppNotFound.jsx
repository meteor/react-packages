AppNotFound = React.createClass({
  render() {
    return (
      <div className="page not-found">
        <nav>
          <MenuOpenToggle />
        </nav>
        <div className="content-scrollable">
          <div className="wrapper-message">
            <div className="title-message">Page not found</div>
          </div>
        </div>
      </div>
    );
  }
});
