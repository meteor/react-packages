/* global Tinytest */
import React, { Suspense, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import { renderHook, act } from '@testing-library/react-hooks';
import { render, cleanup, waitForDomChange } from '@testing-library/react'
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';

import useTracker from './useTracker';

Tinytest.add('useTracker - no deps', async function (test) {
  const reactiveDict = new ReactiveDict();
  let runCount = 0;
  let computation;
  let createdCount = 0;
  let destroyedCount = 0;

  const { result, rerender, unmount, waitForNextUpdate } = renderHook(
    ({ name }) => useTracker(() => {
      runCount++;
      reactiveDict.setDefault(name, 'initial');
      return reactiveDict.get(name);
    }, null, (c) => {
      test.isFalse(c === computation, 'The new computation should always be a new instance');
      computation = c;
      createdCount++;
      return () => {
        destroyedCount++;
      }
    }),
    { initialProps: { name: 'key' } }
  );

  test.equal(result.current, 'initial', 'Expect initial value to be "initial"');
  test.equal(runCount, 1, 'Should have run 1 times');
  test.equal(createdCount, 1, 'Should have been created 1 times');
  test.equal(destroyedCount, 0, 'Should not have been destroyed yet');

  act(() => {
    reactiveDict.set('key', 'changed');
    Tracker.flush({_throwFirstError: true});
  });
  await waitForNextUpdate();

  test.equal(result.current, 'changed', 'Expect new value to be "changed"');
  test.equal(runCount, 2, 'Should have run 2 times');
  test.equal(createdCount, 2, 'Should have been created 2 times');
  test.equal(destroyedCount, 1, 'Should have been destroyed 1 less than created');

  rerender();
  await waitForNextUpdate();

  test.equal(result.current, 'changed', 'Expect value of "changed" to persist after rerender');
  test.equal(runCount, 3, 'Should have run 3 times');
  test.equal(createdCount, 3, 'Should have been created 3 times');
  test.equal(destroyedCount, 2, 'Should have been destroyed 1 less than created');

  rerender({ name: 'different' });
  await waitForNextUpdate();

  test.equal(result.current, 'default', 'After deps change, the default value should have returned');
  test.equal(runCount, 4, 'Should have run 4 times');
  test.equal(createdCount, 4, 'Should have been created 4 times');
  test.equal(destroyedCount, 3, 'Should have been destroyed 1 less than created');

  unmount();
  test.equal(runCount, 4, 'Unmount should not cause a tracker run');
  test.equal(createdCount, 4, 'Should have been created 4 times');
  test.equal(destroyedCount, 4, 'Should have been destroyed the same number of times as created');

  act(() => {
    reactiveDict.set('different', 'changed again');
    Tracker.flush({_throwFirstError: true});
  });
  // we can't use await waitForNextUpdate() here because it doesn't trigger re-render - is there a way to test that?

  test.equal(result.current, 'default', 'After unmount, changes to the reactive source should not update the value.');
  test.equal(runCount, 4, 'After unmount, useTracker should no longer be tracking');
  test.equal(createdCount, 4, 'Should have been created 4 times');
  test.equal(destroyedCount, 4, 'Should have been destroyed the same number of times as created');

  reactiveDict.destroy();
});

Tinytest.add('useTracker - with deps', async function (test) {
  const reactiveDict = new ReactiveDict();
  let runCount = 0;
  let computation;
  let createdCount = 0;
  let destroyedCount = 0;

  const { result, rerender, unmount, waitForNextUpdate } = renderHook(
    ({ name }) => useTracker(() => {
      runCount++;
      reactiveDict.setDefault(name, 'default');
      return reactiveDict.get(name);
    }, [name], (c) => {
      test.isFalse(c === computation, 'The new computation should always be a new instance');
      computation = c;
      createdCount++;
      return () => {
        destroyedCount++;
      }
    }),
    { initialProps: { name: 'name' } }
  );

  test.equal(result.current, 'default', 'Expect the default value for given name to be "default"');
  test.equal(runCount, 1, 'Should have run 1 times');
  test.equal(createdCount, 1, 'Should have been created 1 times');
  test.equal(destroyedCount, 0, 'Should not have been destroyed yet');

  act(() => {
    reactiveDict.set('name', 'changed');
    Tracker.flush({_throwFirstError: true});
  });
  await waitForNextUpdate();

  test.equal(result.current, 'changed', 'Expect the new value for given name to be "changed"');
  test.equal(runCount, 2, 'Should have run 2 times');
  test.equal(createdCount, 1, 'Should have been created 1 times');
  test.equal(destroyedCount, 0, 'Should not have been destroyed yet');

  rerender();
  await waitForNextUpdate();

  test.equal(result.current, 'changed', 'Expect the new value "changed" for given name to have persisted through render');
  test.equal(runCount, 3, 'Should have run 3 times');
  test.equal(createdCount, 1, 'Should have been created 1 times');
  test.equal(destroyedCount, 0, 'Should not have been destroyed yet');

  rerender({ name: 'different' });
  await waitForNextUpdate();

  test.equal(result.current, 'default', 'After deps change, the default value should have returned');
  test.equal(runCount, 4, 'Should have run 4 times');
  test.equal(createdCount, 2, 'Should have been created 2 times');
  test.equal(destroyedCount, 1, 'Should have been destroyed 1 times');

  unmount();
  // we can't use await waitForNextUpdate() here because it doesn't trigger re-render - is there a way to test that?
  test.equal(runCount, 4, 'Unmount should not cause a tracker run');
  test.equal(createdCount, 2, 'Should have been created 2 times');
  test.equal(destroyedCount, 2, 'Should have been destroyed 2 times');

  act(() => {
    reactiveDict.set('different', 'changed again');
    Tracker.flush({_throwFirstError: true});
  });

  test.equal(result.current, 'default', 'After unmount, changes to the reactive source should not update the value.');
  test.equal(runCount, 4, 'After unmount, useTracker should no longer be tracking');
  test.equal(createdCount, 2, 'Should have been created 2 times');
  test.equal(destroyedCount, 2, 'Should have been destroyed 2 times');

  reactiveDict.destroy();
});

const getInnerHtml = function (elem) {
  // clean up elem.innerHTML and strip data-reactid attributes too
  return canonicalizeHtml(elem.innerHTML).replace(/ data-reactroot=".*?"/g, '');
};

if (Meteor.isClient) {
  Tinytest.addAsync('useTracker - suspense, no deps', async function (test) {
    const x = new ReactiveVar(0);

    const cache = { value: 0 };
    const timeout = time => new Promise(resolve => setTimeout(resolve, time));
    const wait = async () => {
      await timeout(100);
      cache.value = 1;
      return cache.value;
    };

    // this simulates a bunch of outside reactive activity
    let i = 0;
    const iId = setInterval(() => {
      x.set(++i);
    }, 2);
    setTimeout(() => {
      clearInterval(iId);
    }, 200);

    let reactiveCount = 0;
    let renderCount = 0;
    const Loading = () => <span>loading</span>
    const Foo = () => {
      const data = useTracker(() => {
        return {
          x: x.get()
        };
      });

      const { value } = cache;

      if (!value) {
        throw wait();
      }

      return <span>complete</span>;
    };

    var { getByText, container } = render(<Suspense fallback={<Loading />}><Foo/></Suspense>);
    test.isTrue(getByText('loading'));

    test.equal(getInnerHtml(container), '<span>loading</span>', 'When suspended on first render, loading text should be displayed.');
    await waitForDomChange({ container, timeout: 250 });

    test.equal(getInnerHtml(container), '<span>complete</span>', 'Once the thrown promise resoles, we should have the complete content.');

    cleanup();
  });

  Tinytest.add('useTracker - basic track', function (test) {
    var div = document.createElement("DIV");

    var x = new ReactiveVar('aaa');

    var Foo = () => {
      const data = useTracker(() => {
        return {
          x: x.get()
        };
      })
      return <span>{data.x}</span>;
    };

    ReactDOM.render(<Foo/>, div);
    test.equal(getInnerHtml(div), '<span>aaa</span>');

    x.set('bbb');
    Tracker.flush({_throwFirstError: true});
    test.equal(getInnerHtml(div), '<span>bbb</span>');

    test.equal(x._numListeners(), 1);

    ReactDOM.unmountComponentAtNode(div);

    test.equal(x._numListeners(), 0);
  });

  // Make sure that calling ReactDOM.render() from an autorun doesn't
  // associate that autorun with the mixin's autorun.  When autoruns are
  // nested, invalidating the outer one stops the inner one, unless
  // Tracker.nonreactive is used.  This test tests for the use of
  // Tracker.nonreactive around the mixin's autorun.
  Tinytest.add('useTracker - render in autorun', function (test) {
    var div = document.createElement("DIV");

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
      ReactDOM.render(<Foo/>, div);
      // Stopping this autorun should not affect the mixin's autorun.
      c.stop();
    });
    test.equal(getInnerHtml(div), '<span>aaa</span>');

    x.set('bbb');
    Tracker.flush({_throwFirstError: true});
    test.equal(getInnerHtml(div), '<span>bbb</span>');

    ReactDOM.unmountComponentAtNode(div);
  });

  Tinytest.add('useTracker - track based on props and state', function (test) {
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

    var { getByText } = render(<Foo n={0}/>);

    test.isTrue(getByText('aaa'), 'Content should still be “aaa” in initial render');
    xs[0].set('AAA');
    test.isTrue(getByText('aaa'), 'Content should still be “aaa” in the dom, since we haven’t flushed yet');
    act(() => Tracker.flush({_throwFirstError: true}));
    test.isTrue(getByText('AAA'), 'Content should still be “AAA” in the dom after Tracker flush');

    cleanup();
    var { getByText } = render(<Foo n={1}/>);

    test.isTrue(getByText('bbb'));
    xs[1].set('BBB');
    act(() => Tracker.flush({_throwFirstError: true}));
    test.isTrue(getByText('BBB'));

    setState({m: 1});

    test.isTrue(getByText('ccc'));
    xs[2].set('CCC');
    act(() => Tracker.flush({_throwFirstError: true}));
    test.isTrue(getByText('CCC'));

    cleanup();
    var { getByText } = render(<Foo n={0}/>);

    setState({m: 0});
    test.isTrue(getByText('AAA'));

    cleanup();
  });

  Tinytest.add('useTracker - track based on props and state (with deps)', function (test) {
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

    var { getByText } = render(<Foo n={0}/>);

    test.isTrue(getByText('aaa'), 'Content should still be “aaa” in initial render');
    xs[0].set('AAA');
    test.isTrue(getByText('aaa'), 'Content should still be “aaa” in the dom, since we haven’t flushed yet');
    act(() => Tracker.flush({_throwFirstError: true}));
    test.isTrue(getByText('AAA'), 'Content should still be “AAA” in the dom after Tracker flush');

    cleanup();
    var { getByText } = render(<Foo n={1}/>);

    test.isTrue(getByText('bbb'));
    xs[1].set('BBB');
    act(() => Tracker.flush({_throwFirstError: true}));
    test.isTrue(getByText('BBB'));

    setState({m: 1});
    test.isTrue(getByText('ccc'));
    xs[2].set('CCC');
    act(() => Tracker.flush({_throwFirstError: true}));
    test.isTrue(getByText('CCC'));

    cleanup();
    var { getByText } = render(<Foo n={0}/>);

    setState({m: 0});
    test.isTrue(getByText('AAA'));

    cleanup();
  });

  function waitFor(func, callback) {
    Tracker.autorun(function (c) {
      if (func()) {
        c.stop();
        callback();
      }
    });
  };

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
        });
        self.data = data;
        return <div>{
          _.map(data.docs, (doc) => <span key={doc._id}>{doc._id}</span>)
        }</div>;
      };

      self.component = ReactDOM.render(<self.Foo/>, self.div);
      test.equal(getInnerHtml(self.div), '<div></div>');

      var handle = self.handle;
      test.isFalse(handle.ready());

      waitFor(() => handle.ready(),
              expect());
    },
    function (test, expect) {
      var self = this;
      test.isTrue(self.handle.ready());
      test.equal(getInnerHtml(self.div), '<div><span>id1</span></div>');

      self.someOtherVar.set('bar');
      self.oldHandle1 = self.handle;

      // can't call Tracker.flush() here (we are in a Tracker.flush already)
      Tracker.afterFlush(expect());
    },
    function (test, expect) {
      var self = this;
      var oldHandle = self.oldHandle1;
      var newHandle = self.handle;
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
      var handle = self.handle;
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
      test.equal(self.data.v, 'baz');
      test.notEqual(self.oldHandle3, self.handle);
      test.equal(self.oldHandle3.subscriptionId,
                 self.handle.subscriptionId);
      test.isTrue(self.handle.ready());
    },
    function (test, expect) {
      ReactDOM.unmountComponentAtNode(this.div);
      // break out of flush time, so we don't call the test's
      // onComplete from within Tracker.flush
      Meteor.defer(expect());
    }
  ]);

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
  Meteor.publish("useTracker-mixin-sub", function (num) {
    Meteor.defer(() => {  // because subs are blocking
      this.added("useTracker-mixin-coll", 'id'+num, {});
      this.ready();
    });
  });
}
