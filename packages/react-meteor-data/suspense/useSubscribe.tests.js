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

      const { queryByText, findByText } = render(<TestSuspense />, {
        container: document.createElement('container'),
      });

      test.isNotNull(
        queryByText('Loading...'),
        'Throw Promise as needed to trigger the fallback.'
      );

      test.isTrue(await findByText('nameA'), 'Need to return data');
    }
  );

  Tinytest.addAsync(
    'suspense/useSubscribe - Simulate running in strict mode',
    async (test) => {
      // Repeated runs of this block should consistently pass without failures.
      for (let i = 0; i < 10; i++) {
        const { result, rerender } = renderHook(
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

        await waitFor(() => {});
      }
    }
  );
}
