// @jsx React.DOM

ListNotFound = React.createClass({
  render() {
    return <div className="page not-found">
      <nav>
        <div className="nav-group">
          <a href="#" className="js-menu nav-item">
            <span className="icon-list-unordered" />
          </a>
        </div>
      </nav>
      <div className="content-scrollable">
        <div className="wrapper-message">
          <div className="title-message">Page not found</div>
        </div>
      </div>
    </div>
  }
});