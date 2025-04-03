/* global Meteor, Tinytest */
import React, { memo, useState } from 'react'
import ReactDOM from 'react-dom'
import { waitFor } from '@testing-library/react'
import { Mongo } from 'meteor/mongo'

import { useFind } from './useFind'

if (Meteor.isClient) {
  Tinytest.addAsync('useFind - Verify reference stability between rerenders', async function (test, completed) {
    const container = document.createElement("DIV")

    const TestDocs = new Mongo.Collection(null)

    TestDocs.insert({
      id: 0,
      updated: 0
    })
    TestDocs.insert({
      id: 1,
      updated: 0
    })
    TestDocs.insert({
      id: 2,
      updated: 0
    })
    TestDocs.insert({
      id: 3,
      updated: 0
    })
    TestDocs.insert({
      id: 4,
      updated: 0
    })

    let renders = 0
    const MemoizedItem = memo(({doc}) => {
      renders++
      return (
        <li>{doc.id},{doc.updated}</li>
      )
    })

    const Test = () => {
      const docs = useFind(() => TestDocs.find(), [])
      return (
        <ul>
          {docs.map(doc =>
            <MemoizedItem key={doc.id} doc={doc} />
          )}
        </ul>
      )
    }

    ReactDOM.render(<Test />, container)
    test.equal(renders, 5, '5 items should have rendered, only 5, no more.')

    await waitFor(() => {}, { container, timeout: 250 })

    await waitFor(() => {
      TestDocs.update({ id: 2 }, { $inc: { updated: 1 } })
    }, { container, timeout: 250 })

    test.equal(renders, 6, '6 items should have rendered - only 1 of the items should have been matched by the reconciler after a single change.')

    completed()
  })

  Tinytest.addAsync('useFind - null return is allowed', async function (test, completed) {
    const container = document.createElement("DIV")

    const TestDocs = new Mongo.Collection(null)

    TestDocs.insert({
      id: 0,
      updated: 0
    })

    let setReturnNull, returnValue;

    const Test = () => {
      const [returnNull, _setReturnNull] = useState(true)
      setReturnNull = _setReturnNull
      const docs = useFind(() => returnNull ? null : TestDocs.find(), [returnNull])
      returnValue = docs;
      if (!docs) {
        return null
      } else {
        return (
          <ul>
            {docs.map(doc =>
              <li key={doc.id} doc={doc} />
            )}
          </ul>
        )
      }
    }

    ReactDOM.render(<Test />, container)
    test.isNull(returnValue, 'Return value should be null when the factory returns null')

    setReturnNull(false)

    await waitFor(() => {}, { container, timeout: 250 })
    test.equal(returnValue.length, 1, 'Return value should be an array with one document')

    completed()
  })
  // Test that catches the issue reported on https://github.com/meteor/react-packages/issues/418
  Tinytest.addAsync(
    'useFind - Immediate update before effect registration (race condition test)',
    async function (test, completed) {
      completed(); // Remove this line to implement your change on packages/react-meteor-data/useFind.ts and check if it is working
      const container = document.createElement('div');
      document.body.appendChild(container);

      const TestDocs = new Mongo.Collection(null);
      // Insert a single document.
      TestDocs.insert({ id: 1, val: 'initial' });

      const Test = () => {
        const docs = useFind(() => TestDocs.find(), []);
        return (
          <div data-testid="doc-value">
            {docs && docs[0] && docs[0].val}
          </div>
        );
      };

      // Render the component.
      ReactDOM.render(<Test />, container);

      // Immediately update the document (this should occur
      // after the synchronous fetch in the old code but before the effect attaches).
      TestDocs.update({ id: 1 }, { $set: { val: 'updated' } });

      // Wait until the rendered output reflects the update.
      await waitFor(() => {
        const node = container.querySelector('[data-testid="doc-value"]');
        if (!node || !node.textContent.includes('updated')) {
          throw new Error('Updated value not rendered yet');
        }
      }, { container, timeout: 500 });

      test.ok(
        container.innerHTML.includes('updated'),
        'Document should display updated value; the old code would fail to capture this update.'
      );

      document.body.removeChild(container);
      completed();
    }
  );
} else {

}
