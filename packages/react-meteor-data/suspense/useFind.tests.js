/* global Meteor, Tinytest */
import React, { Suspense } from 'react'
import { renderToString } from 'react-dom/server'
import { Mongo } from 'meteor/mongo'

import { useFindSuspense } from './useFind'

if (Meteor.isServer) {
  Tinytest.addAsync(
    'suspense/useFind - Data query validation',
    async function (test) {
      const TestDocs = new Mongo.Collection(null)

      TestDocs.insertAsync({ id: 0, updated: 0 })

      let returnValue

      const Test = () => {
        returnValue = useFindSuspense(TestDocs, [{}])

        return null
      }
      const TestSuspense = () => {
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <Test />
          </Suspense>
        )
      }

      // first return promise
      renderToString(<TestSuspense />)
      test.isUndefined(
        returnValue,
        'Return value should be undefined as find promise unresolved'
      );
      // wait promise
      await new Promise((resolve) => setTimeout(resolve, 100))
      // return data
      renderToString(<TestSuspense />)

      test.equal(
        returnValue.length,
        1,
        'Return value should be an array with one document'
      )
    }
  )

  Tinytest.addAsync(
    'suspense/useFind - Test proper cache invalidation',
    async function (test) {
      const TestDocs = new Mongo.Collection(null)

      TestDocs.insertAsync({ id: 0, updated: 0 })

      let returnValue

      const Test = () => {
        returnValue = useFindSuspense(TestDocs, [{}])

        return null
      }
      const TestSuspense = () => {
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <Test />
          </Suspense>
        )
      }

      // first return promise
      renderToString(<TestSuspense />)

      test.isUndefined(
        returnValue,
        'Return value should be undefined as find promise unresolved'
      );
      // wait promise
      await new Promise((resolve) => setTimeout(resolve, 100))
      // return data
      renderToString(<TestSuspense />)

      test.equal(
        returnValue[0].updated,
        0,
        'Return value should be an array with initial value as find promise resolved'
      );

      TestDocs.updateAsync({ id: 0 }, { $inc: { updated: 1 } })
      await new Promise((resolve) => setTimeout(resolve, 100))

      // second return promise
      renderToString(<TestSuspense />)

      test.equal(
        returnValue[0].updated,
        0,
        'Return value should still not updated as second find promise unresolved'
      );

      // wait promise
      await new Promise((resolve) => setTimeout(resolve, 100))
      // return data
      renderToString(<TestSuspense />)

      test.equal(
        returnValue[0].updated,
        1,
        'Return value should be an array with one document with value updated'
      )
    }
  )

  Tinytest.addAsync(
    'suspense/useFind - null return is allowed',
    async function (test) {
      const TestDocs = new Mongo.Collection(null)

      TestDocs.insertAsync({ id: 0, updated: 0 })

      let returnValue

      const Test = () => {
        returnValue = useFindSuspense(TestDocs, null)

        return null
      }
      const TestSuspense = () => {
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <Test />
          </Suspense>
        )
      }

      renderToString(<TestSuspense returnNull={true} />)

      test.isNull(
        returnValue,
        'Return value should be null when the factory returns null'
      )
    }
  )
}
