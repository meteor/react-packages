getInnerHtml = function (elem) {
  // clean up elem.innerHTML and strip data-reactid attributes too
  return canonicalizeHtml(elem.innerHTML).replace(/ data-reactid=".*?"/g, '');
};

Tinytest.add('react-meteor-data - basic track', function (test) {
  var div = document.createElement("DIV");

  var x = new ReactiveVar('aaa');

  var Foo = React.createClass({
    mixins: [MeteorDataMixin],
    trackMeteorData() {
      return {
        x: x.get()
      };
    },
    render() {
      return <span>{this.data.x}</span>;
    }
  });

  React.render(<Foo/>, div);
  test.equal(getInnerHtml(div), '<span>aaa</span>');

  x.set('bbb');
  Tracker.flush();
  test.equal(getInnerHtml(div), '<span>bbb</span>');

  test.equal(x._numListeners(), 1);

  React.unmountComponentAtNode(div);

  test.equal(x._numListeners(), 0);
});

Tinytest.add('react-meteor-data - render in autorun', function (test) {
  var div = document.createElement("DIV");

  var x = new ReactiveVar('aaa');

  var Foo = React.createClass({
    mixins: [MeteorDataMixin],
    trackMeteorData() {
      return {
        x: x.get()
      };
    },
    render() {
      return <span>{this.data.x}</span>;
    }
  });

  Tracker.autorun(function (c) {
    React.render(<Foo/>, div);
    // Stopping this autorun should not affect the mixin's autorun.
    c.stop();
  });
  test.equal(getInnerHtml(div), '<span>aaa</span>');

  x.set('bbb');
  Tracker.flush();
  test.equal(getInnerHtml(div), '<span>bbb</span>');

  React.unmountComponentAtNode(div);
});

Tinytest.add('react-meteor-data - track based on props and state', function (test) {
  var div = document.createElement("DIV");

  var xs = [new ReactiveVar('aaa'),
            new ReactiveVar('bbb'),
            new ReactiveVar('ccc')];

  var Foo = React.createClass({
    mixins: [MeteorDataMixin],
    trackMeteorData(props, state) {
      return {
        x: xs[state.m + props.n].get()
      };
    },
    getInitialState() {
      return { m: 0 };
    },
    render() {
      return <span>{this.data.x}</span>;
    }
  });

  var comp = React.render(<Foo n={0}/>, div);

  test.equal(getInnerHtml(div), '<span>aaa</span>');
  xs[0].set('AAA');
  test.equal(getInnerHtml(div), '<span>aaa</span>');
  Tracker.flush();
  test.equal(getInnerHtml(div), '<span>AAA</span>');

  {
    let comp2 = React.render(<Foo n={1}/>, div);
    test.isTrue(comp === comp2);
  }

  test.equal(getInnerHtml(div), '<span>bbb</span>');
  xs[1].set('BBB');
  Tracker.flush();
  test.equal(getInnerHtml(div), '<span>BBB</span>');

  comp.setState({m: 1});
  test.equal(getInnerHtml(div), '<span>ccc</span>');
  xs[2].set('CCC');
  Tracker.flush();
  test.equal(getInnerHtml(div), '<span>CCC</span>');

  React.render(<Foo n={0}/>, div);
  comp.setState({m: 0});
  test.equal(getInnerHtml(div), '<span>AAA</span>');

  React.unmountComponentAtNode(div);
});

function waitFor(func, callback) {
  Tracker.autorun(function (c) {
    if (func()) {
      c.stop();
      callback();
    }
  });
};

testAsyncMulti('react-meteor-data - resubscribe', [
  function (test, expect) {
    var self = this;
    self.div = document.createElement("DIV");
    self.collection = new Mongo.Collection("react-meteor-data-mixin-coll");
    self.num = new ReactiveVar(1);
    self.someOtherVar = new ReactiveVar('foo');
    self.Foo = React.createClass({
      mixins: [MeteorDataMixin],
      trackMeteorData(props, state) {
        this.handle =
          Meteor.subscribe("react-meteor-data-mixin-sub",
                           self.num.get());

        return {
          v: self.someOtherVar.get(),
          docs: _.filter(self.collection.find().fetch(), o => o.awesome)
        };
      },
      render() {
        return <div>{
          _.map(this.data.docs, (doc) => <span key={doc._id}>{doc._id}</span>)
        }</div>;
      }
    });

    self.component = React.render(<self.Foo/>, self.div);
    test.equal(getInnerHtml(self.div), '<div></div>');

    var handle = self.component.handle;
    test.isFalse(handle.ready());

    waitFor(() => handle.ready(),
            expect());
  },
  function (test, expect) {
    var self = this;
    test.isTrue(self.component.handle.ready());
    test.equal(getInnerHtml(self.div), '<div><span>id1</span></div>');

    self.someOtherVar.set('bar');
    self.oldHandle1 = self.component.handle;

    // can't call Tracker.flush() here (we are in a Tracker.flush already)
    Tracker.afterFlush(expect());
  },
  function (test, expect) {
    var self = this;
    var oldHandle = self.oldHandle1;
    var newHandle = self.component.handle;
    test.notEqual(oldHandle, newHandle); // new handle
    test.equal(newHandle.subscriptionId, oldHandle.subscriptionId); // same sub
    test.isTrue(newHandle.ready()); // doesn't become unready
    // no change to the content
    test.equal(getInnerHtml(self.div), '<div><span>id1</span></div>');

    // ok, now change the `num` argument to the subscription
    self.num.set(2);
    self.oldHandle2 = newHandle;
    Tracker.afterFlush(expect());
  },
  function (test, expect) {
    var self = this;
    // data is still there
    test.equal(getInnerHtml(self.div), '<div><span>id1</span></div>');
    // handle is no longer ready
    var handle = self.component.handle;
    test.isFalse(handle.ready());
    // different sub ID
    test.isTrue(self.oldHandle2.subscriptionId);
    test.isTrue(handle.subscriptionId);
    test.notEqual(handle.subscriptionId, self.oldHandle2.subscriptionId);

    waitFor(() => handle.ready(),
            expect());
  },
  function (test, expect) {
    var self = this;
    // now we see the new data! (and maybe the old data...)
    test.equal(getInnerHtml(self.div).replace('<span>id1</span>', ''),
               '<div><span>id2</span></div>');

    self.someOtherVar.set('baz');
    self.oldHandle3 = self.component.handle;

    Tracker.afterFlush(expect());
  },
  function (test, expect) {
    var self = this;
    test.equal(self.component.data.v, 'baz');
    test.notEqual(self.oldHandle3, self.component.handle);
    test.equal(self.oldHandle3.subscriptionId,
               self.component.handle.subscriptionId);
    test.isTrue(self.component.handle.ready());
  },
  function (test, expect) {
    React.unmountComponentAtNode(this.div);
    // break out of flush time, so we don't call the test's
    // onComplete from within Tracker.flush
    Meteor.defer(expect());
  }
]);
