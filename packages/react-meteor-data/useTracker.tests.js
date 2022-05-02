/* global Meteor, Tinytest */
import React, { useState, useReducer, StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { cleanup, waitFor } from '@testing-library/react';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';

import useTracker from './useTracker';

if (Meteor.isClient) {
  const getInnerHtml = function (elem) {
    // clean up elem.innerHTML and strip data-reactid attributes too
    return canonicalizeHtml(elem.innerHTML).replace(/ data-reactroot=".*?"/g, '');
  };

  // :TODO: Write tests to confirm internal assumptions when ErrorBoundaries or Suspense are used.
  // :NOTE: Suspense is only for loading modules, not data - at the time of writing.
  // :TODO: Write tests for ConcurrentMode

  const noDepsTester = async (test, mode = 'normal') => {
    const container = document.createElement("DIV");

    const reactiveDict = new ReactiveDict();
    let runCount = 0;
    let value;
    const Test = () => {
      value = useTracker(() => {
        runCount++;
        reactiveDict.setDefault('key', 'initial');
        return reactiveDict.get('key');
      });
      return <span>{value}</span>;
    };

    let rerender, unmount;
    const TestContainer = () => {
      [, rerender] = useReducer((x) => x + 1, 0);
      const [mounted, setMounted] = useState(true);
      unmount = () => setMounted(false);
      return mode === 'normal'
        ? mounted ? <Test /> : null
        : <StrictMode>{mounted ? <Test /> : null}</StrictMode>
    };

    ReactDOM.render(<TestContainer />, container);

    // wait for useEffect
    await waitFor(() => {}, { container, timeout: 250 });

    test.equal(value, 'initial', 'Expect initial value to be "initial"');

    await waitFor(() => {
      reactiveDict.set('key', 'changed');
      Tracker.flush({_throwFirstError: true});
    }, { container, timeout: 250 });

    test.equal(value, 'changed', 'Expect new value to be "changed"');

    await waitFor(() => {
      rerender();
    }, { container, timeout: 250 });

    test.equal(value, 'changed', 'Expect value of "changed" to persist after rerender');

    await waitFor(() => {
      unmount();
    }, { container, timeout: 250 });

    await waitFor(() => {
      reactiveDict.set('different', 'changed again');
      Tracker.flush({_throwFirstError: true});
    }, { container, timeout: 250 });

    test.equal(value, 'changed', 'After unmount, changes to the reactive source should not update the value.');

    reactiveDict.destroy();
  };

  Tinytest.addAsync('useTracker (no deps) - Normal', async function (test, completed) {
    await noDepsTester(test);
    completed();
  });

  Tinytest.addAsync('useTracker (no deps) - in StrictMode', async function (test, completed) {
    await noDepsTester(test, 'strict-mode');
    completed();
  });

  const depsTester = async (test, mode = 'normal') => {
    const container = document.createElement("DIV");

    const reactiveDict = new ReactiveDict();
    let runCount = 0;
    let value;
    const Test = ({ name }) => {
      value = useTracker(() => {
        runCount++;
        reactiveDict.setDefault(name, 'initial');
        return reactiveDict.get(name);
      }, [name]);
      return <span>{value}</span>;
    };

    let rerender, unmount;
    const TestContainer = () => {
      [, forceRender] = useReducer((x) => x + 1, 0);
      const [mounted, setMounted] = useState(true);
      const [name, setName] = useState('name');
      rerender = (name = null) =>
        name ? setName(name) : forceRender();
      unmount = () => setMounted(false);
      return mode === 'normal'
        ? mounted ? <Test name={name} /> : null
        : <StrictMode>{mounted ? <Test name={name} /> : null}</StrictMode>
    };

    ReactDOM.render(<TestContainer />, container);

    // wait for useEffect
    await waitFor(() => {}, { container, timeout: 250 });

    test.equal(value, 'initial', 'Expect the initial value for given name to be "initial"');

    await waitFor(() => {
      reactiveDict.set('name', 'changed');
      Tracker.flush({_throwFirstError: true});
    }, { container, timeout: 250 });

    test.equal(value, 'changed', 'Expect the new value for given name to be "changed"');

    await waitFor(() => {
      rerender();
    }, { container, timeout: 250 });

    test.equal(value, 'changed', 'Expect the new value "changed" for given name to have persisted through render');

    await waitFor(() => {
      rerender('different');
    }, { container, timeout: 250 });

    test.equal(value, 'initial', 'After deps change, the initial value should have returned');

    await waitFor(() => {
      unmount();
    }, { container, timeout: 250 });

    reactiveDict.destroy();
  };

  Tinytest.addAsync('useTracker - Normal', async function (test, completed) {
    await depsTester(test);
    completed();
  });

  Tinytest.addAsync('useTracker - in StrictMode', async function (test, completed) {
    await depsTester(test, 'strict-mode');
    completed();
  });

  async function testSkipUpdate (test, deps) {
    /**
     * In cases where a state change causes rerender before the render is
     * committed, useMemo will only run on the first render. This can cause the
     * value to get lost (unexpected undefined), if we aren't careful.
     */
    const container = document.createElement("DIV");
    const reactiveDict = new ReactiveDict();
    let value;
    let renders = 0;
    const skipUpdate = (prev, next) => {
      // only update when second changes, not first
      return prev.second === next.second;
    };
    const Test = () => {
      renders++;
      value = useTracker(
        () => {
          reactiveDict.setDefault('key', { first: 0, second: 0 });
          return reactiveDict.get('key');
        },
        deps || skipUpdate,
        deps ? skipUpdate : undefined
      );
      return <span>{JSON.stringify(value)}</span>;
    };

    ReactDOM.render(<Test />, container);
    test.equal(renders, 1, 'Should have rendered only once');

    // wait for useEffect
    await waitFor(() => {}, { container, timeout: 250 });
    test.equal(renders, 1, 'Should have rendered only once after mount');

    reactiveDict.set('key', { first: 1, second: 0 });
    await waitFor(() => {}, { container, timeout: 250 });

    test.equal(renders, 1, "Should still have rendered only once");

    reactiveDict.set('key', { first: 1, second: 1 });
    await waitFor(() => {}, { container, timeout: 250 });

    test.equal(renders, 2, "Should have rendered a second time");
  }

  Tinytest.addAsync('useTracker - skipUpdate prevents rerenders', async function (test, completed) {
    await testSkipUpdate(test, []);
    completed();
  });

  Tinytest.addAsync('useTracker (no deps) - skipUpdate prevents rerenders', async function (test, completed) {
    await testSkipUpdate(test);
    completed();
  });

  Tinytest.addAsync('useTracker (no deps) - basic track', async function (test, completed) {
    var container = document.createElement("DIV");

    var x = new ReactiveVar('aaa');

    var Foo = () => {
      const data = useTracker(() => {
        return {
          x: x.get()
        };
      });
      return <span>{data.x}</span>;
    };

    ReactDOM.render(<Foo/>, container);
    test.equal(getInnerHtml(container), '<span>aaa</span>');

    x.set('bbb');
    await waitFor(() => {
      Tracker.flush({_throwFirstError: true});
    }, { container, timeout: 250 });

    test.equal(getInnerHtml(container), '<span>bbb</span>');

    test.equal(x._numListeners(), 1);

    await waitFor(() => {
      ReactDOM.unmountComponentAtNode(container);
    }, { container, timeout: 250 });

    test.equal(x._numListeners(), 0);

    completed();
  });

  Tinytest.addAsync('useTracker - basic track', async function (test, completed) {
    var container = document.createElement("DIV");

    var x = new ReactiveVar('aaa');

    var Foo = () => {
      const data = useTracker(() => {
        return {
          x: x.get()
        };
      }, []);
      return <span>{data.x}</span>;
    };

    ReactDOM.render(<Foo/>, container);
    test.equal(getInnerHtml(container), '<span>aaa</span>');

    x.set('bbb');
    await waitFor(() => {
      Tracker.flush({_throwFirstError: true});
    }, { container, timeout: 250 });

    test.equal(getInnerHtml(container), '<span>bbb</span>');

    test.equal(x._numListeners(), 1);

    await waitFor(() => {
      ReactDOM.unmountComponentAtNode(container);
    }, { container, timeout: 250 });

    test.equal(x._numListeners(), 0);

    completed();
  });

  // Make sure that calling ReactDOM.render() from an autorun doesn't
  // associate that autorun with the mixin's autorun.  When autoruns are
  // nested, invalidating the outer one stops the inner one, unless
  // Tracker.nonreactive is used.  This test tests for the use of
  // Tracker.nonreactive around the mixin's autorun.
  Tinytest.addAsync('useTracker (no deps) - render in autorun', async function (test, completed) {
    var container = document.createElement("DIV");

    var x = new ReactiveVar('aaa');

    var Foo = () => {
      const data = useTracker(() => {
        return {
          x: x.get()
        };
      });
      return <span>{data.x}</span>;
    };

    Tracker.autorun(function (c) {
      ReactDOM.render(<Foo/>, container);
      // Stopping this autorun should not affect the mixin's autorun.
      c.stop();
    });
    test.equal(getInnerHtml(container), '<span>aaa</span>');

    x.set('bbb');
    await waitFor(() => {
      Tracker.flush({_throwFirstError: true});
    }, { container, timeout: 250 });
    test.equal(getInnerHtml(container), '<span>bbb</span>');

    ReactDOM.unmountComponentAtNode(container);

    completed();
  });


  // Make sure that calling ReactDOM.render() from an autorun doesn't
  // associate that autorun with the mixin's autorun.  When autoruns are
  // nested, invalidating the outer one stops the inner one, unless
  // Tracker.nonreactive is used.  This test tests for the use of
  // Tracker.nonreactive around the mixin's autorun.
  Tinytest.addAsync('useTracker - render in autorun', async function (test, completed) {
    var container = document.createElement("DIV");

    var x = new ReactiveVar('aaa');

    var Foo = () => {
      const data = useTracker(() => {
        return {
          x: x.get()
        };
      }, []);
      return <span>{data.x}</span>;
    };

    Tracker.autorun(function (c) {
      ReactDOM.render(<Foo/>, container);
      // Stopping this autorun should not affect the mixin's autorun.
      c.stop();
    });
    test.equal(getInnerHtml(container), '<span>aaa</span>');

    x.set('bbb');
    await waitFor(() => {
      Tracker.flush({_throwFirstError: true});
    }, { container, timeout: 250 });
    test.equal(getInnerHtml(container), '<span>bbb</span>');

    ReactDOM.unmountComponentAtNode(container);

    completed();
  });

  Tinytest.addAsync('useTracker (no deps) - track based on props and state', async function (test, completed) {
    var container = document.createElement("DIV");

    var xs = [new ReactiveVar('aaa'),
              new ReactiveVar('bbb'),
              new ReactiveVar('ccc')];

    let setState;
    var Foo = (props) => {
      const [state, _setState] = useState({ m: 0 });
      setState = _setState;
      const data = useTracker(() => {
        return {
          x: xs[state.m + props.n].get()
        };
      });
      return <span>{data.x}</span>;
    };

    ReactDOM.render(<Foo n={0}/>, container);

    test.equal(getInnerHtml(container), '<span>aaa</span>', 'Content should still be “aaa” in initial render');

    xs[0].set('AAA');
    test.equal(getInnerHtml(container), '<span>aaa</span>', 'Content should still be “aaa” in the dom, since we haven’t flushed yet');
    await waitFor(() => {
      Tracker.flush({_throwFirstError: true});
    }, { container, timeout: 250 });
    test.equal(getInnerHtml(container), '<span>AAA</span>', 'Content should still be “AAA” in the dom after Tracker flush');

    ReactDOM.unmountComponentAtNode(container);

    ReactDOM.render(<Foo n={1}/>, container);

    test.equal(getInnerHtml(container), '<span>bbb</span>', 'Content should still be “bbb”');

    xs[1].set('BBB');
    await waitFor(() => {
      Tracker.flush({_throwFirstError: true});
    }, { container, timeout: 250 });
    test.equal(getInnerHtml(container), '<span>BBB</span>', 'Content should still be “BBB” in the dom after Tracker flush');

    setState({m: 1});
    await waitFor(() => {
      Tracker.flush({_throwFirstError: true});
    }, { container, timeout: 250 });
    test.equal(getInnerHtml(container), '<span>ccc</span>', 'Content should still be “ccc” in the dom after Tracker flush');

    xs[2].set('CCC');
    await waitFor(() => {
      Tracker.flush({_throwFirstError: true});
    }, { container, timeout: 250 });
    test.equal(getInnerHtml(container), '<span>CCC</span>', 'Content should still be “CCC” in the dom after Tracker flush');

    ReactDOM.unmountComponentAtNode(container);

    ReactDOM.render(<Foo n={0}/>, container);

    setState({m: 0});
    await waitFor(() => {
      Tracker.flush({_throwFirstError: true});
    }, { container, timeout: 250 });
    test.equal(getInnerHtml(container), '<span>AAA</span>', 'Content should still be “AAA” in the dom after Tracker flush');

    ReactDOM.unmountComponentAtNode(container);

    completed();
  });

  Tinytest.addAsync('useTracker - track based on props and state', async function (test, completed) {
    var container = document.createElement("DIV");

    var xs = [new ReactiveVar('aaa'),
              new ReactiveVar('bbb'),
              new ReactiveVar('ccc')];

    let setState;
    var Foo = (props) => {
      const [state, _setState] = useState({ m: 0 });
      setState = _setState;
      const data = useTracker(() => {
        return {
          x: xs[state.m + props.n].get()
        };
      }, [state.m, props.n]);
      return <span>{data.x}</span>;
    };

    ReactDOM.render(<Foo n={0}/>, container);

    test.equal(getInnerHtml(container), '<span>aaa</span>', 'Content should still be “aaa” in initial render');
    xs[0].set('AAA');
    test.equal(getInnerHtml(container), '<span>aaa</span>', 'Content should still be “aaa” in the dom, since we haven’t flushed yet');
    await waitFor(() => {
      Tracker.flush({_throwFirstError: true});
    }, { container, timeout: 250 });
    test.equal(getInnerHtml(container), '<span>AAA</span>', 'Content should still be “AAA” in the dom after Tracker flush');

    ReactDOM.unmountComponentAtNode(container);

    ReactDOM.render(<Foo n={1}/>, container);

    test.equal(getInnerHtml(container), '<span>bbb</span>');

    xs[1].set('BBB');
    await waitFor(() => {
      Tracker.flush({_throwFirstError: true});
    }, { container, timeout: 250 });
    test.equal(getInnerHtml(container), '<span>BBB</span>');

    setState({m: 1});
    test.equal(getInnerHtml(container), '<span>ccc</span>');
    xs[2].set('CCC');
    await waitFor(() => {
      Tracker.flush({_throwFirstError: true});
    }, { container, timeout: 250 });
    test.equal(getInnerHtml(container), '<span>CCC</span>');

    ReactDOM.unmountComponentAtNode(container);

    ReactDOM.render(<Foo n={0}/>, container);

    setState({m: 0});
    test.equal(getInnerHtml(container), '<span>AAA</span>');

    cleanup();

    completed();
  });

  function waitForTracker(func, callback) {
    Tracker.autorun(function (c) {
      if (func()) {
        c.stop();
        callback();
      }
    });
  };

  testAsyncMulti('useTracker (no deps) - resubscribe', [
    function (test, expect) {
      var self = this;
      self.div = document.createElement("DIV");
      self.collection = new Mongo.Collection("useTrackerLegacy-mixin-coll");
      self.num = new ReactiveVar(1);
      self.someOtherVar = new ReactiveVar('foo');
      self.Foo = () => {
        const data = useTracker(() => {
          self.handle =
            Meteor.subscribe("useTrackerLegacy-mixin-sub",
                             self.num.get());

          return {
            v: self.someOtherVar.get(),
            docs: self.collection.find().fetch()
          };
        });
        self.data = data;
        return <div>{
          _.map(data.docs, (doc) => <span key={doc._id}>{doc._id}</span>)
        }</div>;
      };

      self.component = ReactDOM.render(<self.Foo/>, self.div);
      test.equal(getInnerHtml(self.div), '<div></div>', 'div should be empty');

      var handle = self.handle;
      test.isFalse(handle.ready(), 'handle.ready() should be false');

      waitForTracker(() => handle.ready(),
              expect());
    },
    function (test, expect) {
      var self = this;
      test.isTrue(self.handle.ready(), 'self.handle.ready() should be true');
      test.equal(getInnerHtml(self.div), '<div><span>id1</span></div>', 'div should contain id1');

      self.someOtherVar.set('bar');
      self.oldHandle1 = self.handle;

      // can't call Tracker.flush() here (we are in a Tracker.flush already)
      Tracker.afterFlush(expect());
    },
    function (test, expect) {
      var self = this;
      var oldHandle = self.oldHandle1;
      var newHandle = self.handle;
      test.notEqual(oldHandle, newHandle, 'handles should be different instances'); // new handle
      test.equal(newHandle.subscriptionId, oldHandle.subscriptionId, 'subscriptionId should be different'); // same sub
      test.isTrue(newHandle.ready(), 'newHandle.ready() should be true'); // doesn't become unready
      // no change to the content
      test.equal(getInnerHtml(self.div), '<div><span>id1</span></div>', 'div should contain id1');

      // ok, now change the `num` argument to the subscription
      self.num.set(2);
      self.oldHandle2 = newHandle;
      Tracker.afterFlush(expect());
    },
    function (test, expect) {
      var self = this;
      // data is still there
      test.equal(getInnerHtml(self.div), '<div><span>id1</span></div>', 'div shold contain id1');
      // handle is no longer ready
      var handle = self.handle;
      test.isFalse(handle.ready(), 'handle.ready() should be false');
      // different sub ID
      test.isTrue(self.oldHandle2.subscriptionId, 'self.oldHandle2.subscriptionId should be truthy');
      test.isTrue(handle.subscriptionId, 'handle.subscriptionId should be truthy');
      test.notEqual(handle.subscriptionId, self.oldHandle2.subscriptionId, 'subscriptionId should match');

      waitForTracker(() => handle.ready(),
              expect());
    },
    function (test, expect) {
      var self = this;
      // now we see the new data! (and maybe the old data, because
      // when a subscription goes away, its data doesn't disappear right
      // away; the server has to tell the client which documents or which
      // properties to remove, and this is not easy to wait for either; see
      // https://github.com/meteor/meteor/issues/2440)
      test.equal(getInnerHtml(self.div).replace('<span>id1</span>', ''),
                 '<div><span>id2</span></div>');

      self.someOtherVar.set('baz');
      self.oldHandle3 = self.handle;

      Tracker.afterFlush(expect());
    },
    function (test, expect) {
      var self = this;
      test.equal(self.data.v, 'baz', 'self.data.v should be "baz"');
      test.notEqual(self.oldHandle3, self.handle, 'oldHandle3 shold match self.handle');
      test.equal(self.oldHandle3.subscriptionId,
                 self.handle.subscriptionId, 'same for subscriptionId');
      test.isTrue(self.handle.ready(), 'self.handle.ready() should be true');
    },
    function (test, expect) {
      ReactDOM.unmountComponentAtNode(this.div);
      // break out of flush time, so we don't call the test's
      // onComplete from within Tracker.flush
      Meteor.defer(expect());
    }
  ]);

  testAsyncMulti('useTracker - resubscribe', [
    function (test, expect) {
      var self = this;
      self.div = document.createElement("DIV");
      self.collection = new Mongo.Collection("useTracker-mixin-coll");
      self.num = new ReactiveVar(1);
      self.someOtherVar = new ReactiveVar('foo');
      self.Foo = () => {
        const data = useTracker(() => {
          self.handle =
            Meteor.subscribe("useTracker-mixin-sub",
                             self.num.get());

          return {
            v: self.someOtherVar.get(),
            docs: self.collection.find().fetch()
          };
        }, []);
        self.data = data;
        return <div>{
          _.map(data.docs, (doc) => <span key={doc._id}>{doc._id}</span>)
        }</div>;
      };

      self.component = ReactDOM.render(<self.Foo/>, self.div);
      test.equal(getInnerHtml(self.div), '<div></div>', 'div should be empty');

      var handle = self.handle;
      test.isFalse(handle.ready(), 'handle.ready() should be false');

      waitForTracker(() => handle.ready(),
              expect());
    },
    function (test, expect) {
      var self = this;
      test.isTrue(self.handle.ready(), 'self.handle.ready() should be true');
      test.equal(getInnerHtml(self.div), '<div><span>id1</span></div>', 'div should contain id1');

      self.someOtherVar.set('bar');
      self.oldHandle1 = self.handle;

      // can't call Tracker.flush() here (we are in a Tracker.flush already)
      Tracker.afterFlush(expect());
    },
    function (test, expect) {
      var self = this;
      var oldHandle = self.oldHandle1;
      var newHandle = self.handle;
      test.notEqual(oldHandle, newHandle, 'handles should be different instances'); // new handle
      test.equal(newHandle.subscriptionId, oldHandle.subscriptionId, 'subscriptionId should be different'); // same sub
      test.isTrue(newHandle.ready(), 'newHandle.ready() should be true'); // doesn't become unready
      // no change to the content
      test.equal(getInnerHtml(self.div), '<div><span>id1</span></div>', 'div should contain id1');

      // ok, now change the `num` argument to the subscription
      self.num.set(2);
      self.oldHandle2 = newHandle;
      Tracker.afterFlush(expect());
    },
    function (test, expect) {
      var self = this;
      // data is still there
      test.equal(getInnerHtml(self.div), '<div><span>id1</span></div>', 'div shold contain id1');
      // handle is no longer ready
      var handle = self.handle;
      test.isFalse(handle.ready(), 'handle.ready() should be false');
      // different sub ID
      test.isTrue(self.oldHandle2.subscriptionId, 'self.oldHandle2.subscriptionId should be truthy');
      test.isTrue(handle.subscriptionId, 'handle.subscriptionId should be truthy');
      test.notEqual(handle.subscriptionId, self.oldHandle2.subscriptionId, 'subscriptionId should match');

      waitForTracker(() => handle.ready(),
              expect());
    },
    function (test, expect) {
      var self = this;
      // now we see the new data! (and maybe the old data, because
      // when a subscription goes away, its data doesn't disappear right
      // away; the server has to tell the client which documents or which
      // properties to remove, and this is not easy to wait for either; see
      // https://github.com/meteor/meteor/issues/2440)
      test.equal(getInnerHtml(self.div).replace('<span>id1</span>', ''),
                 '<div><span>id2</span></div>');

      self.someOtherVar.set('baz');
      self.oldHandle3 = self.handle;

      Tracker.afterFlush(expect());
    },
    function (test, expect) {
      var self = this;
      test.equal(self.data.v, 'baz', 'self.data.v should be "baz"');
      test.notEqual(self.oldHandle3, self.handle, 'oldHandle3 shold match self.handle');
      test.equal(self.oldHandle3.subscriptionId,
                 self.handle.subscriptionId, 'same for subscriptionId');
      test.isTrue(self.handle.ready(), 'self.handle.ready() should be true');
    },
    function (test, expect) {
      ReactDOM.unmountComponentAtNode(this.div);
      // break out of flush time, so we don't call the test's
      // onComplete from within Tracker.flush
      Meteor.defer(expect());
    }
  ]);

  Tinytest.addAsync('useTracker - immediate rerender does not result in `undefined`', async function (test, completed) {
    /**
     * In cases where a state change causes rerender before the render is
     * committed, useMemo will only run on the first render. This can cause the
     * value to get lost (unexpected undefined), if we aren't careful.
     */
    const container = document.createElement("DIV");
    const reactiveDict = new ReactiveDict();
    let value;
    let renderCount = 0;
    const Test = ({ afterMountInc = false }) => {
      renderCount++;
      const [num, setNum] = useState(0);
      value = useTracker(() => {
        reactiveDict.setDefault('key', 'initial');
        return reactiveDict.get('key');
      }, []);
      if (num === 0) {
        reactiveDict.set('key', 'secondary');
        setNum(1);
      }
      if (afterMountInc && num !== 2) {
        reactiveDict.set('key', 'third');
        setNum(2);
      }
      return <span>{value}</span>;
    };

    const strict = 2;
    let afterMountInc, setAfterMountInc;
    const TestContainer = () => {
      [afterMountInc, setAfterMountInc] = useState(false);
      return <StrictMode><Test afterMountInc={afterMountInc} /></StrictMode>;
    };

    ReactDOM.render(<TestContainer />, container);
    test.equal(value, 'secondary', 'value should be "secondary" and not undefined');
    test.equal(renderCount, 2 * strict, "Should have rendered twice before mount");

    // wait for useEffect
    await waitFor(() => {}, { container, timeout: 250 });

    test.equal(value, 'secondary', 'value should still be "secondary" after mount');
    test.equal(renderCount, 3 * strict, "Should have rendered 3 times after mount");

    renderCount = 0;
    // trigger after mount immediate rerender
    setAfterMountInc(true);

    await waitFor(() => {}, { container, timeout: 250 });

    test.equal(value, 'third', 'value should still be "third" after immediate rerender after mount');
    test.equal(renderCount, 3 * strict, "Should have rendered 3 times");

    completed();
  });

  // Tinytest.add(
  //   "useTracker - print warning if return cursor from useTracker",
  //   function (test) {
  //     var coll = new Mongo.Collection(null);
  //     var ComponentWithCursor = () => {
  //       useTracker(() => {
  //         return {
  //           theCursor: coll.find()
  //         };
  //       });
  //       return <span></span>;
  //     };

  //     // Check if we print a warning to console about props
  //     // You can be sure this test is correct because we have an identical one in
  //     // react-runtime-dev
  //     let warning;
  //     try {
  //       var oldWarn = console.warn;
  //       console.warn = function specialWarn(message) {
  //         warning = message;
  //       };

  //       var div = document.createElement("DIV");
  //       ReactDOM.render(<ComponentWithCursor />, div);

  //       test.matches(warning, /cursor before returning it/);
  //     } finally {
  //       console.warn = oldWarn;
  //     }
  //   });

} else {
  Meteor.publish("useTrackerLegacy-mixin-sub", function (num) {
    Meteor.defer(() => {  // because subs are blocking
      this.added("useTrackerLegacy-mixin-coll", 'id'+num, {});
      this.ready();
    });
  });
  Meteor.publish("useTracker-mixin-sub", function (num) {
    Meteor.defer(() => {  // because subs are blocking
      this.added("useTracker-mixin-coll", 'id'+num, {});
      this.ready();
    });
  });
}
