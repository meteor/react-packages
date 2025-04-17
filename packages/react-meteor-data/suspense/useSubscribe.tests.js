import React, { Suspense } from 'react';
import { waitFor, render, renderHook } from '@testing-library/react';

import { useSubscribeSuspense } from './useSubscribe';

if (Meteor.isServer) {
  Meteor.publish('testUseSubscribe', function () {
    this.added('testCollection', 0, { name: 'nameA' });
    this.ready();
  });
} else {
  Tinytest.addAsync(
    'suspense/useSubscribe - Verified data returned successfully',
    async (test) => {
      const TestCollection = new Mongo.Collection('testCollection');

      const Test = () => {
        useSubscribeSuspense('testUseSubscribe');

        const doc = TestCollection.findOne();

        return <div>{doc.name}</div>;
      };
      const TestSuspense = () => {
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <Test />
          </Suspense>
        );
      };

      const { queryByText, findByText, unmount } = render(<TestSuspense />, {
        container: document.createElement('container'),
      });

      test.isNotNull(
        queryByText('Loading...'),
        'Throw Promise as needed to trigger the fallback.'
      );

      test.isTrue(await findByText('nameA'), 'Need to return data');

      unmount();
    }
  );

  Tinytest.addAsync(
    'suspense/useSubscribe - Simulate running in strict mode',
    async (test) => {
      // Repeated runs of this block should consistently pass without failures.
      for (let i = 0; i < 10; i++) {
        const { result, rerender, unmount } = renderHook(
          () => {
            try {
              return useSubscribeSuspense('testUseSubscribe');
            } catch (promise) {
              return promise;
            }
          },
          {
            reactStrictMode: true,
          }
        );

        await result.current;

        rerender();

        test.isNull(
          result.current,
          'Should be null after rerender (this indicates the data has been read)'
        );

        unmount();
      }
    }
  );

  Tinytest.addAsync(
    'suspense/useSubscribe - when multiple subscriptions are active, cleaning one preserves others',
    async (test) => {
      // Run in both normal mode and strict mode respectively.
      for (const reactStrictMode of [false, true]) {
        const {
          result: resultA,
          rerender: rerenderA,
          unmount: unmountA,
        } = renderHook(
          () => {
            try {
              return useSubscribeSuspense('testUseSubscribe');
            } catch (promise) {
              return promise;
            }
          },
          { reactStrictMode }
        );

        await resultA.current;
        rerenderA();

        const { result: resultB, unmount: unmountB } = renderHook(
          () => {
            try {
              return useSubscribeSuspense('testUseSubscribe');
            } catch (promise) {
              return promise;
            }
          },
          { reactStrictMode }
        );

        test.isNull(
          resultB.current,
          'Should be null after subscribeA (this indicates the data has been cached)'
        );

        unmountB();
        await waitFor(() => {});

        rerenderA();

        test.isNull(
          resultA.current,
          'Should be null (this indicates the data has been cached)'
        );

        unmountA();
        await waitFor(() => {});

        const { result: resultA2, unmount: unmountA2 } = renderHook(
          () => {
            try {
              return useSubscribeSuspense('testUseSubscribe');
            } catch (promise) {
              return promise;
            }
          },
          { reactStrictMode }
        );

        test.instanceOf(
          resultA2.current,
          Promise,
          'Should be a promise (this indicates the data has been cleaned)'
        );

        await resultA2.current;
        unmountA2();
      }
    }
  );
}
