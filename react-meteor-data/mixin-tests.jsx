getInnerHtml = function (elem) {
  // clean up elem.innerHTML and strip data-reactid attributes too
  return canonicalizeHtml(elem.innerHTML).replace(/ data-reactid=".*?"/g, '');
};

Tinytest.add('react-meteor-mixin - basic track', function (test) {
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

Tinytest.add('react-meteor-mixin - render in autorun', function (test) {
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

Tinytest.add('react-meteor-mixin - track based on props and state', function (test) {
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
