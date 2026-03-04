/* global Meteor, Tinytest */
import React, { memo, useEffect, useLayoutEffect, useState } from 'react'
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

  Tinytest.addAsync(
    'useFind - reuses document references when deps recreate the cursor',
    async function (test, completed) {
      const container = document.createElement('div')

      const TestDocs = new Mongo.Collection(null)
      for (let i = 0; i < 5; i++) {
        TestDocs.insert({ id: i })
      }

      let renders = 0
      const MemoizedItem = memo(({ doc }) => {
        renders++
        return <li>{doc.id}</li>
      })

      const Test = () => {
        const [rerendered, setRerendered] = useState(false)
        const docs = useFind(() => TestDocs.find({}, { sort: { id: 1 } }), [rerendered])

        useEffect(() => {
          if (!rerendered) {
            setRerendered(true)
          }
        }, [rerendered])

        return (
          <div>
            <div data-testid="rerender-flag">{String(rerendered)}</div>
            <ul>
              {docs.map(doc => (
                <MemoizedItem key={doc.id} doc={doc} />
              ))}
            </ul>
          </div>
        )
      }

      ReactDOM.render(<Test />, container)
      test.equal(renders, 5, 'Initial renders should occur once per document')

      await waitFor(() => {
        const flag = container.querySelector('[data-testid="rerender-flag"]')
        if (!flag || flag.textContent !== 'true') {
          throw new Error('Component has not rerendered yet')
        }
      }, { container, timeout: 250 })

      test.equal(
        renders,
        5,
        'Document references should remain stable when deps recreate the cursor'
      )

      completed()
    }
  )

  Tinytest.addAsync(
    'useFind - recreating cursor with modified documents re-renders memoized items',
    async function (test, completed) {
      const container = document.createElement('div')

      const PrimaryDocs = new Mongo.Collection(null)
      const SecondaryDocs = new Mongo.Collection(null)

      for (let i = 0; i < 4; i++) {
        PrimaryDocs.insert({ _id: `doc-${i}`, id: i, label: `primary-${i}` })
        SecondaryDocs.insert({ _id: `doc-${i}`, id: i, label: `secondary-${i}` })
      }

      let renders = 0
      const MemoizedItem = memo(({ doc }) => {
        renders++
        return <li>{doc.label}</li>
      })

      const Test = () => {
        const [useAlternate, setUseAlternate] = useState(false)
        const collection = useAlternate ? SecondaryDocs : PrimaryDocs
        const docs = useFind(() => collection.find({}, { sort: { id: 1 } }), [useAlternate])

        useEffect(() => {
          if (!useAlternate) {
            setUseAlternate(true)
          }
        }, [useAlternate])

        return (
          <ul>
            {docs.map(doc => (
              <MemoizedItem key={doc._id} doc={doc} />
            ))}
          </ul>
        )
      }

      ReactDOM.render(<Test />, container)
      test.equal(renders, 4, 'Initial renders should occur once per document')

      await waitFor(() => {
        if (!container.textContent?.includes('secondary-0')) {
          throw new Error('Alternate collection has not rendered yet')
        }
      }, { container, timeout: 500 })

      test.equal(
        renders,
        8,
        'Documents should rerender when deps recreate the cursor with modified data'
      )

      completed()
    }
  )

  Tinytest.addAsync(
    'useFind - recreating cursor with different sort order updates ordering',
    async function (test, completed) {
      const container = document.createElement('div')

      const TestDocs = new Mongo.Collection(null)
      for (let i = 0; i < 4; i++) {
        TestDocs.insert({ id: i })
      }

      const Test = () => {
        const [ascending, setAscending] = useState(true)
        const docs = useFind(
          () => TestDocs.find({}, { sort: { id: ascending ? 1 : -1 } }),
          [ascending]
        )

        useEffect(() => {
          if (ascending) {
            setAscending(false)
          }
        }, [ascending])

        return (
          <div>
            {docs.map(doc => (
              <div key={doc.id} data-testid="doc-id">{doc.id}</div>
            ))}
          </div>
        )
      }

      ReactDOM.render(<Test />, container)

      const getIds = () => Array.from(
        container.querySelectorAll('[data-testid="doc-id"]')
      ).map(node => node.textContent)

      test.equal(getIds(), ['0', '1', '2', '3'], 'Initial render should be ascending')

      await waitFor(() => {
        const ids = getIds()
        if (ids[0] !== '3') {
          throw new Error('Documents have not been reordered yet')
        }
      }, { container, timeout: 500 })

      test.equal(
        getIds(),
        ['3', '2', '1', '0'],
        'Documents should be rendered in descending order after deps change'
      )

      completed()
    }
  )

  Tinytest.addAsync(
    'useFind - recreating cursor with different projection re-renders memoized items',
    async function (test, completed) {
      const container = document.createElement('div')

      const TestDocs = new Mongo.Collection(null)
      for (let i = 0; i < 3; i++) {
        TestDocs.insert({ _id: `doc-${i}`, id: i, label: `label-${i}`, detail: `detail-${i}` })
      }

      let renders = 0
      const MemoizedItem = memo(({ doc }) => {
        renders++
        return <li>{doc.label}::{doc.detail || 'none'}</li>
      })

      const Test = () => {
        const [includeDetail, setIncludeDetail] = useState(false)
        const docs = useFind(
          () => TestDocs.find(
            {},
            {
              sort: { id: 1 },
              transform: doc => {
                if (!includeDetail) {
                  return { _id: doc._id, label: doc.label }
                }
                return { _id: doc._id, label: doc.label, detail: doc.detail }
              }
            }
          ),
          [includeDetail]
        )

        useEffect(() => {
          if (!includeDetail) {
            setIncludeDetail(true)
          }
        }, [includeDetail])

        return (
          <ul>
            {docs.map(doc => (
              <MemoizedItem key={doc._id} doc={doc} />
            ))}
          </ul>
        )
      }

      ReactDOM.render(<Test />, container)
      test.equal(renders, 3, 'Initial renders should occur once per document')

      await waitFor(() => {
        if (!container.textContent?.includes('detail-0')) {
          throw new Error('Projected detail fields have not rendered yet')
        }
      }, { container, timeout: 500 })

      test.equal(
        renders,
        6,
        'Documents should rerender when cursor projection adds new fields'
      )

      completed()
    }
  )

  Tinytest.addAsync(
    'useFind - handles cursor recreation without duplicating documents',
    async function (test, completed) {
      const container = document.createElement('div')
      document.body.appendChild(container)

      const TestDocs = new Mongo.Collection(null)
      TestDocs.insert({ id: 'a', label: 'a' })

      const Test = () => {
        const [rerendered, setRerendered] = useState(false)
        const docs = useFind(() => TestDocs.find({}, { sort: { id: 1 } }), [rerendered])

        useEffect(() => {
          setRerendered(true)
        }, [])

        useLayoutEffect(() => {
          if (!rerendered || TestDocs.findOne({ id: 'b' })) {
            return
          }

          TestDocs.insert({ id: 'b', label: 'b' })
        }, [rerendered])

        return (
          <div>
            {docs && docs.map(doc => (
              <div key={doc.id} data-testid="doc-id">{doc.id}</div>
            ))}
          </div>
        )
      }

      ReactDOM.render(<Test />, container)

      const getIds = () => Array.from(container.querySelectorAll('[data-testid=\"doc-id\"]')).map(node => node.textContent)

      await waitFor(() => {
        const ids = getIds()
        if (ids.length !== 2) {
          throw new Error('Expected two documents')
        }
        if (ids[0] !== 'a' || ids[1] !== 'b') {
          throw new Error('Unexpected document order')
        }
      }, { container, timeout: 500 })

      test.equal(getIds(), ['a', 'b'], 'Documents should not duplicate when deps change')

      document.body.removeChild(container)
      completed()
    }
  )
} else {

}
