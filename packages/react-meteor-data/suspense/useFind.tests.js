/* global Meteor, Tinytest */
import React, { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { Mongo } from 'meteor/mongo';
import { renderHook, waitFor } from '@testing-library/react';
import { useFindSuspenseClient, useFindSuspenseServer } from './useFind';

/**
 * Test for useFindSuspenseClient
 */
if (Meteor.isClient) {
  Tinytest.addAsync(
    'suspense/useFindSuspenseClient - Verify reference stability between rerenders',
    async (test) => {
      const TestDocs = new Mongo.Collection(null);

      TestDocs.insert({ id: 0, updated: 0 });
      TestDocs.insert({ id: 1, updated: 0 });

      const { result, rerender } = renderHook(() =>
        useFindSuspenseClient(TestDocs, [{}])
      );

      test.equal(
        result.current.length,
        2,
        '2 items should have rendered, only 2, no more.'
      );

      await TestDocs.updateAsync({ id: 1 }, { $inc: { updated: 1 } });

      rerender();

      test.equal(
        result.current.length,
        2,
        '2 items should have rendered - only 1 of the items should have been matched by the reconciler after a single change.'
      );
    }
  );

  Tinytest.addAsync(
    'suspense/useFindSuspenseClient - null return is allowed',
    async (test) => {
      const TestDocs = new Mongo.Collection(null);

      TestDocs.insertAsync({ id: 0, updated: 0 });

      const { result } = renderHook(() =>
        useFindSuspenseClient(TestDocs, null)
      );

      test.isNull(
        result.current,
        'Return value should be null when the factory returns null'
      );
    }
  );

  Tinytest.addAsync(
    'suspense/useFindSuspenseClient - cursor change returns new docs on same render',
    async (test) => {
      const TestDocs = new Mongo.Collection(null);

      TestDocs.insert({ _id: 'a', n: 1 });
      TestDocs.insert({ _id: 'b', n: 2 });

      const idsPerRender = [];
      const { rerender } = renderHook(
        ({ id }) => {
          const docs = useFindSuspenseClient(TestDocs, [{ _id: id }], [id]);
          idsPerRender.push(docs?.[0]?._id);
          return docs;
        },
        { initialProps: { id: 'a' } }
      );

      test.equal(idsPerRender[0], 'a', 'initial render should return doc a');

      const afterChange = idsPerRender.length;
      rerender({ id: 'b' });

      test.equal(
        idsPerRender[afterChange],
        'b',
        'first render after cursor change must already be the new docs, not the previous cursor result'
      );
    }
  );

  Tinytest.addAsync(
    'suspense/useFindSuspenseClient - null to cursor returns docs on same render',
    async (test) => {
      const TestDocs = new Mongo.Collection(null);

      TestDocs.insert({ _id: 'a', n: 1 });

      const valuesPerRender = [];
      const { rerender } = renderHook(
        ({ findArgs }) => {
          const docs = useFindSuspenseClient(TestDocs, findArgs, [findArgs]);
          valuesPerRender.push(docs);
          return docs;
        },
        { initialProps: { findArgs: null } }
      );

      test.isNull(valuesPerRender[0], 'initial render should return null');

      const afterChange = valuesPerRender.length;
      rerender({ findArgs: [{}] });

      test.equal(
        valuesPerRender[afterChange]?.[0]?._id,
        'a',
        'first render after enabling a cursor must already contain the documents, not an empty leftover array'
      );
    }
  );

  Tinytest.addAsync(
    'suspense/useFindSuspenseClient - cursor to null returns null on same render',
    async (test) => {
      const TestDocs = new Mongo.Collection(null);

      TestDocs.insert({ _id: 'a', n: 1 });

      const valuesPerRender = [];
      const { rerender } = renderHook(
        ({ findArgs }) => {
          const docs = useFindSuspenseClient(TestDocs, findArgs, [findArgs]);
          valuesPerRender.push(docs);
          return docs;
        },
        { initialProps: { findArgs: [{}] } }
      );

      test.equal(valuesPerRender[0]?.[0]?._id, 'a');

      const afterChange = valuesPerRender.length;
      rerender({ findArgs: null });

      test.isNull(
        valuesPerRender[afterChange],
        'first render after clearing the cursor must already be null'
      );
    }
  );

  Tinytest.addAsync(
    'suspense/useFindSuspenseClient - observe still applies incremental updates',
    async (test) => {
      const TestDocs = new Mongo.Collection(null);

      TestDocs.insert({ _id: 'a', updated: 0 });

      const { result } = renderHook(() =>
        useFindSuspenseClient(TestDocs, [{}], [])
      );

      test.equal(result.current[0].updated, 0);

      await TestDocs.updateAsync({ _id: 'a' }, { $inc: { updated: 1 } });

      await waitFor(() => {
        if (result.current[0].updated !== 1) {
          throw new Error('Incremental update not applied yet');
        }
      });

      test.equal(
        result.current[0].updated,
        1,
        'observe should update the snapshot without changing findArgs'
      );
    }
  );

  Tinytest.addAsync(
    'suspense/useFindSuspenseClient - cursor change resubscribes to the new cursor only',
    async (test) => {
      const TestDocs = new Mongo.Collection(null);

      TestDocs.insert({ _id: 'a', val: 0 });
      TestDocs.insert({ _id: 'b', val: 0 });

      let renderCount = 0;
      const { result, rerender } = renderHook(
        ({ id }) => {
          renderCount++;
          return useFindSuspenseClient(TestDocs, [{ _id: id }], [id]);
        },
        { initialProps: { id: 'a' } }
      );

      rerender({ id: 'b' });
      test.equal(result.current[0]._id, 'b');

      // Updates to the new cursor must be applied by the new observer.
      await TestDocs.updateAsync({ _id: 'b' }, { $set: { val: 1 } });
      await waitFor(() => {
        if (result.current[0].val !== 1) {
          throw new Error('Update to new cursor not applied yet');
        }
      });

      // Updates to the old cursor must not leak in through a stale observer.
      const renderCountBefore = renderCount;
      await TestDocs.updateAsync({ _id: 'a' }, { $set: { val: 99 } });
      await new Promise((resolve) => setTimeout(resolve, 0));

      test.equal(result.current.length, 1);
      test.equal(result.current[0]._id, 'b');
      test.equal(result.current[0].val, 1);
      test.equal(
        renderCount,
        renderCountBefore,
        'update to the old cursor should not trigger a rerender'
      );
    }
  );
}

/**
 * Test for useFindSuspenseServer
 */
if (Meteor.isServer) {
  Tinytest.addAsync(
    'suspense/useFindSuspenseServer - Data query validation',
    async function (test) {
      const TestDocs = new Mongo.Collection(null);

      TestDocs.insertAsync({ id: 0, updated: 0 });

      let returnValue;

      const Test = () => {
        returnValue = useFindSuspenseServer(TestDocs, [{}]);

        return null;
      };
      const TestSuspense = () => {
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <Test />
          </Suspense>
        );
      };

      // first return promise
      renderToString(<TestSuspense />);
      test.isUndefined(
        returnValue,
        'Return value should be undefined as find promise unresolved'
      );
      // wait promise
      await new Promise((resolve) => setTimeout(resolve, 100));
      // return data
      renderToString(<TestSuspense />);

      test.equal(
        returnValue.length,
        1,
        'Return value should be an array with one document'
      );
    }
  );

  Tinytest.addAsync(
    'suspense/useFindSuspenseServer - Test proper cache invalidation',
    async function (test) {
      const TestDocs = new Mongo.Collection(null);

      TestDocs.insertAsync({ id: 0, updated: 0 });

      let returnValue;

      const Test = () => {
        returnValue = useFindSuspenseServer(TestDocs, [{}]);

        return null;
      };
      const TestSuspense = () => {
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <Test />
          </Suspense>
        );
      };

      // first return promise
      renderToString(<TestSuspense />);

      test.isUndefined(
        returnValue,
        'Return value should be undefined as find promise unresolved'
      );
      // wait promise
      await new Promise((resolve) => setTimeout(resolve, 100));
      // return data
      renderToString(<TestSuspense />);

      test.equal(
        returnValue[0].updated,
        0,
        'Return value should be an array with initial value as find promise resolved'
      );

      TestDocs.updateAsync({ id: 0 }, { $inc: { updated: 1 } });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // second return promise
      renderToString(<TestSuspense />);

      test.equal(
        returnValue[0].updated,
        0,
        'Return value should still not updated as second find promise unresolved'
      );

      // wait promise
      await new Promise((resolve) => setTimeout(resolve, 100));
      // return data
      renderToString(<TestSuspense />);

      test.equal(
        returnValue[0].updated,
        1,
        'Return value should be an array with one document with value updated'
      );
    }
  );

  Tinytest.addAsync(
    'suspense/useFindSuspenseServer - null return is allowed',
    async function (test) {
      const TestDocs = new Mongo.Collection(null);

      TestDocs.insertAsync({ id: 0, updated: 0 });

      let returnValue;

      const Test = () => {
        returnValue = useFindSuspenseServer(TestDocs, null);

        return null;
      };
      const TestSuspense = () => {
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <Test />
          </Suspense>
        );
      };

      renderToString(<TestSuspense returnNull={true} />);

      test.isNull(
        returnValue,
        'Return value should be null when the factory returns null'
      );
    }
  );
}
