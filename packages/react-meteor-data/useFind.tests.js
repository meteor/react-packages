/* global Meteor, Tinytest */
import React, { memo } from 'react'
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

    test.equal(renders, 10, '10 items should have rendered - the initial list is always tossed.')

    await waitFor(() => {
      TestDocs.update({ id: 2 }, { $inc: { updated: 1 } })
    }, { container, timeout: 250 })

    test.equal(renders, 11, '11 items should have rendered - only 1 of the items should have been matched by the reconciler after a single change.')

    completed()
  })

} else {

}
