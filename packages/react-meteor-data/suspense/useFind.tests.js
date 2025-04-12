/* global Meteor, Tinytest */
import React, { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { Mongo } from 'meteor/mongo';
import { renderHook } from '@testing-library/react';
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
