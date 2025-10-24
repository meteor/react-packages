/* global Meteor, Tinytest */
import React, { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { Mongo } from 'meteor/mongo';
import { render } from '@testing-library/react';
import { useTracker, cacheMap } from './useTracker';

const clearCache = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  cacheMap.clear();
};

const setupTest = (data = { id: 0, updated: 0 }) => {
  const Coll = new Mongo.Collection(null);
  data && Coll.insertAsync(data);

  return { Coll, simpleFetch: () => Coll.find().fetchAsync() };
};

const TestSuspense = ({ children }) => {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
};

const trackerVariants = [
  {
    label: 'default',
    useTrackerFn: (key, fn, skipUpdate, _deps) =>
      useTracker(key, fn, skipUpdate),
  },
  {
    label: 'with deps',
    useTrackerFn: (key, fn, skipUpdate, deps = []) =>
      useTracker(key, fn, deps, skipUpdate),
  },
];

const runForVariants = (name, testBody) => {
  trackerVariants.forEach(({ label, useTrackerFn }) => {
    Tinytest.addAsync(`${name} [${label}]`, (test) =>
      testBody(test, useTrackerFn)
    );
  });
};

/**
 * Test for useTracker with Suspense
 */
runForVariants(
  'suspense/useTracker - Data query validation',
  async (test, useTrackerFn) => {
    const { simpleFetch } = setupTest();

    let returnValue;

    const Test = () => {
      returnValue = useTrackerFn('TestDocs', simpleFetch);

      return null;
    };

    // first return promise
    renderToString(
      <TestSuspense>
        <Test />
      </TestSuspense>
    );
    test.isUndefined(
      returnValue,
      'Return value should be undefined as find promise unresolved'
    );
    // wait promise
    await new Promise((resolve) => setTimeout(resolve, 100));
    // return data
    renderToString(
      <TestSuspense>
        <Test />
      </TestSuspense>
    );

    test.equal(
      returnValue.length,
      1,
      'Return value should be an array with one document'
    );

    await clearCache();
  }
);

Meteor.isClient &&
  runForVariants(
    'suspense/useTracker - Data query validation with Strict Mode',
    async function (test, useTrackerFn) {
      const { simpleFetch } = setupTest({ id: 0, name: 'a' });

      const Test = () => {
        const docs = useTrackerFn('TestDocs', simpleFetch);

        return <div>{docs[0]?.name}</div>;
      };

      const { findByText } = render(<Test />, {
        container: document.createElement('container'),
        wrapper: TestSuspense,
        reactStrictMode: true,
      });

      test.isTrue(await findByText('a'), 'Need to return data');

      await clearCache();
    }
  );

Meteor.isServer &&
  runForVariants(
    'suspense/useTracker - Test proper cache invalidation',
    async function (test, useTrackerFn) {
      const { Coll, simpleFetch } = setupTest();

      let returnValue;

      const Test = () => {
        returnValue = useTrackerFn('TestDocs', simpleFetch);
        return null;
      };

      // first return promise
      renderToString(
        <TestSuspense>
          <Test />
        </TestSuspense>
      );
      // wait promise
      await new Promise((resolve) => setTimeout(resolve, 100));
      // return data
      renderToString(
        <TestSuspense>
          <Test />
        </TestSuspense>
      );

      test.equal(
        returnValue[0].updated,
        0,
        'Return value should be an array with initial value as find promise resolved'
      );

      Coll.updateAsync({ id: 0 }, { $inc: { updated: 1 } });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // second return promise
      renderToString(
        <TestSuspense>
          <Test />
        </TestSuspense>
      );

      test.equal(
        returnValue[0].updated,
        0,
        'Return value should still not updated as second find promise unresolved'
      );

      // wait promise
      await new Promise((resolve) => setTimeout(resolve, 100));
      // return data
      renderToString(
        <TestSuspense>
          <Test />
        </TestSuspense>
      );
      renderToString(
        <TestSuspense>
          <Test />
        </TestSuspense>
      );
      renderToString(
        <TestSuspense>
          <Test />
        </TestSuspense>
      );

      test.equal(
        returnValue[0].updated,
        1,
        'Return value should be an array with one document with value updated'
      );

      await clearCache();
    }
  );

Meteor.isClient &&
  runForVariants(
    'suspense/useTracker - Test responsive behavior',
    async function (test, useTrackerFn) {
      const { Coll, simpleFetch } = setupTest();

      const Test = () => {
        const docs = useTrackerFn('TestDocs', simpleFetch);
        return <div>{docs[0]?.updated}</div>;
      };

      const { findByText } = render(<Test />, {
        container: document.createElement('container'),
        wrapper: TestSuspense,
        reactStrictMode: true,
      });

      test.isTrue(await findByText('0'), 'Need to return data');

      Coll.updateAsync({ id: 0 }, { $inc: { updated: 1 } });

      test.isTrue(await findByText('1'), 'Need to return data');

      await clearCache();
    }
  );

Meteor.isClient &&
  runForVariants(
    'suspense/useTracker - Test responsive behavior with Strict Mode',
    async function (test, useTrackerFn) {
      const { Coll, simpleFetch } = setupTest({ id: 0, name: 'a' });

      const Test = () => {
        const docs = useTrackerFn('TestDocs', simpleFetch);

        return <div>{docs[0]?.name}</div>;
      };

      const { findByText } = render(<Test />, {
        container: document.createElement('container'),
        wrapper: TestSuspense,
        reactStrictMode: true,
      });

      test.isTrue(await findByText('a'), 'Need to return data');

      Coll.updateAsync({ id: 0 }, { $set: { name: 'b' } });

      test.isTrue(await findByText('b'), 'Need to return data');

      await clearCache();
    }
  );

Meteor.isClient &&
  runForVariants(
    'suspense/useTracker - Test useTracker with skipUpdate',
    async function (test, useTrackerFn) {
      const { Coll, simpleFetch } = setupTest({ id: 0, updated: 0, other: 0 });

      let returnValue;

      const Test = () => {
        returnValue = useTrackerFn('TestDocs', simpleFetch, (prev, next) => {
          // Skip update if the document has not changed
          return prev[0].updated === next[0].updated;
        });

        return null;
      };

      // first return promise
      renderToString(
        <TestSuspense>
          <Test />
        </TestSuspense>
      );
      // wait promise
      await new Promise((resolve) => setTimeout(resolve, 100));
      // return data
      renderToString(
        <TestSuspense>
          <Test />
        </TestSuspense>
      );

      test.equal(
        returnValue[0].updated,
        0,
        'Return value should be an array with initial value as find promise resolved'
      );

      Coll.updateAsync({ id: 0 }, { $inc: { other: 1 } });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // second return promise
      renderToString(
        <TestSuspense>
          <Test />
        </TestSuspense>
      );
      // wait promise
      await new Promise((resolve) => setTimeout(resolve, 100));
      // return data
      renderToString(
        <TestSuspense>
          <Test />
        </TestSuspense>
      );

      test.equal(
        returnValue[0].other,
        0,
        'Return value should still not updated as skipUpdate returned true'
      );

      await clearCache();
    }
  );

// https://github.com/meteor/react-packages/issues/454
Meteor.isClient &&
  runForVariants(
    'suspense/useTracker - Testing performance with multiple Trackers',
    async (test, useTrackerFn) => {
      const TestCollections = [];
      let returnDocs = new Map();

      for (let i = 0; i < 100; i++) {
        const { Coll } = setupTest(null);

        for (let i = 0; i < 100; i++) {
          Coll.insertAsync({ id: i });
        }

        TestCollections.push(Coll);
      }

      const Test = ({ collection, index }) => {
        const docsCount = useTrackerFn(`TestDocs${index}`, () =>
          collection.find().fetchAsync()
        ).length;

        returnDocs.set(`TestDocs${index}`, docsCount);

        return null;
      };
      const TestWrap = () => {
        return (
          <TestSuspense>
            {TestCollections.map((collection, index) => (
              <Test key={index} collection={collection} index={index} />
            ))}
          </TestSuspense>
        );
      };

      // first return promise
      renderToString(<TestWrap />);
      // wait promise
      await new Promise((resolve) => setTimeout(resolve, 100));
      // return data
      renderToString(<TestWrap />);

      test.equal(returnDocs.size, 100, 'should return 100 collections');

      const docsCount = Array.from(returnDocs.values()).reduce(
        (a, b) => a + b,
        0
      );

      test.equal(docsCount, 10000, 'should return 10000 documents');

      await clearCache();
    }
  );

Meteor.isServer &&
  runForVariants(
    'suspense/useTracker - Test no memory leaks',
    async function (test, useTrackerFn) {
      const { simpleFetch } = setupTest();

      let returnValue;

      const Test = () => {
        returnValue = useTrackerFn('TestDocs', simpleFetch);

        return null;
      };

      // first return promise
      renderToString(
        <TestSuspense>
          <Test />
        </TestSuspense>
      );
      // wait promise
      await new Promise((resolve) => setTimeout(resolve, 100));
      // return data
      renderToString(
        <TestSuspense>
          <Test />
        </TestSuspense>
      );
      // wait cleanup
      await new Promise((resolve) => setTimeout(resolve, 100));

      test.equal(
        cacheMap.size,
        0,
        'Cache map should be empty as server cache should be cleared after render'
      );
    }
  );

Meteor.isClient &&
  runForVariants(
    'suspense/useTracker - Test no memory leaks',
    async function (test, useTrackerFn) {
      const { simpleFetch } = setupTest({ id: 0, name: 'a' });

      const Test = () => {
        const docs = useTrackerFn('TestDocs', simpleFetch);

        return <div>{docs[0]?.name}</div>;
      };

      const { queryByText, findByText, unmount } = render(<Test />, {
        container: document.createElement('container'),
        wrapper: TestSuspense,
      });

      test.isNotNull(
        queryByText('Loading...'),
        'Throw Promise as needed to trigger the fallback.'
      );

      test.isTrue(await findByText('a'), 'Need to return data');

      unmount();
      // wait cleanup
      await new Promise((resolve) => setTimeout(resolve, 100));

      test.equal(
        cacheMap.size,
        0,
        'Cache map should be empty as component unmounted and cache cleared'
      );
    }
  );

Meteor.isClient &&
  runForVariants(
    'suspense/useTracker - component unmount in Strict Mode',
    async function (test, useTrackerFn) {
      const { simpleFetch } = setupTest();

      const Test = () => {
        useTrackerFn('TestDocs', simpleFetch);

        return null;
      };

      const { queryByText, findByText, unmount } = render(<Test />, {
        container: document.createElement('container'),
        wrapper: TestSuspense,
        reactStrictMode: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      unmount();

      test.isTrue(true, 'should handle unmount correctly in Strict Mode');
    }
  );

Meteor.isClient &&
  runForVariants(
    'suspense/useTracker - test query condition change',
    async function (test, useTrackerFn) {
      const { Coll } = setupTest(null);
      Coll.insertAsync({ id: 0, name: 'a' });
      Coll.insertAsync({ id: 0, name: 'b' });

      const Test = (props) => {
        const docs = useTrackerFn(
          'TestDocs',
          () => Coll.find({ name: props.name }).fetchAsync(),
          null,
          [props.name]
        );

        return <div>{docs[0]?.name}</div>;
      };

      const { rerender, findByText } = render(<Test name="a" />, {
        container: document.createElement('container'),
        wrapper: TestSuspense,
        reactStrictMode: true,
      });

      test.isTrue(await findByText('a'), 'Need to return data');

      rerender(<Test name="b" />);

      test.isTrue(await findByText('b'), 'Need to return data');

      await clearCache();
    }
  );
