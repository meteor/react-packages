// @jsx React.DOM

var {
  Link,
  Navigation,
  State
} = ReactRouter;

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
      lists: Lists.find().fetch()
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
        { self.data.subsReady && self.getListId() ?
          <ListShow listId={ self.getListId() } /> :
          <AppLoading /> }
      </div>
    </div>
  }
});