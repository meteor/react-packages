// @jsx React.DOM

AppBody = ReactMeteor.createClass({
  getInitialState: function () {
    return {
      lists: []
    };
  },
  getMeteorState: function () {
    subsReady = _.all(this.props.handles, function (handle) {
      return handle.ready();
    });

    return {
      lists: Lists.find().fetch(),
      listsSubscriptionsReady: subsReady
    };
  },
  addList: function () {
    var list = {
      name: Lists.defaultName(),
      incompleteCount: 0
    };

    var listId = Lists.insert(list);

    FlowRouter.go('todoList', { listId: listId });
  },
  render: function () {
    var self = this;

    return <div id="container">
      <section id="menu">
        <div className="list-todos">
          <a className="link-list-new" onClick={ self.addList }>
            <span className="icon-plus"></span>
            New List
          </a>
          { self.state.lists.map(function (list) {

            var className = "list-todo";
            if (FlowRouter.current().params.listId === list._id) {
              className += " active";
            }

            return <a
              className={ className }
              key={ list._id }
              href={ FlowRouter.path("todoList", { listId: list._id }) } >
                { list.name }
                { list.incompleteCount ?
                  <span className="count-list">
                    { list.incompleteCount }
                  </span> : "" }
            </a>
          }) }
        </div>
      </section>
      <div className="content-overlay"></div>
      <div id="content-container">
        { self.state.listsSubscriptionsReady ?
          <ListShow listId={ self.props.params.listId } /> :
          <AppLoading /> }
      </div>
    </div>
  }
});