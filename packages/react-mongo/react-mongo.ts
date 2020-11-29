import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Tracker } from 'meteor/tracker'
import { EJSON } from 'meteor/ejson'
import { useEffect, useReducer, useRef, DependencyList, Reducer, useMemo } from 'react'

const fur = (x: number): number => x + 1
const useForceUpdate = () => useReducer(fur, 0)[1]

type useSubscriptionRefs = {
  subscription?: Meteor.SubscriptionHandle,
  updateOnReady: boolean,
  isReady: boolean,
  params: {
    name?: string,
    args: any[]
  }
}

const useSubscriptionClient = (name?: string, ...args: any[]): [() => boolean, Meteor.SubscriptionHandle | undefined] => {
  const forceUpdate = useForceUpdate()

  const refs: useSubscriptionRefs = useRef({
    updateOnReady: false,
    isReady: false,
    params: {
      name,
      args
    }
  }).current

  if (!EJSON.equals(refs.params, { name, args })) {
    refs.updateOnReady = false
    refs.isReady = false
    refs.params = { name, args }
  }

  useEffect(() => {
    const computation = Tracker.nonreactive(() => (
      Tracker.autorun(() => {
        const { name, args } = refs.params
        if (!name) return

        refs.subscription = Meteor.subscribe(name, ...args)

        const isReady = refs.subscription.ready()
        if (isReady !== refs.isReady) {
          refs.isReady = isReady
          if (refs.updateOnReady) {
            forceUpdate()
          }
        }
      })
    ))

    return () => {
      computation.stop()
      delete refs.subscription
    }
  }, [refs.params])

  return [
    () => {
      refs.updateOnReady = true
      return !refs.isReady
    },
    refs.subscription
  ]
}

const useSubscriptionServer = (name?: string, ...args: any[]): [() => boolean, Meteor.SubscriptionHandle | undefined] => ([
  () => false,
  undefined
])

export const useSubscription = Meteor.isServer
  ? useSubscriptionServer
  : useSubscriptionClient

type useFindActions<T> =
  | { type: 'refresh', data: T[] }
  | { type: 'addedAt', document: T, atIndex: number }
  | { type: 'changedAt', document: T, atIndex: number }
  | { type: 'removedAt', atIndex: number }
  | { type: 'movedTo', fromIndex: number, toIndex: number }

const useFindReducer = <T>(data: T[], action: useFindActions<T>): T[] => {
  switch (action.type) {
    case 'refresh':
      return action.data
    case 'addedAt':
      return [
        ...data.slice(0, action.atIndex),
        action.document,
        ...data.slice(action.atIndex)
      ]
    case 'changedAt':
      return [
        ...data.slice(0, action.atIndex),
        action.document,
        ...data.slice(action.atIndex + 1)
      ]
    case 'removedAt':
      return [
        ...data.slice(0, action.atIndex),
        ...data.slice(action.atIndex + 1)
      ]
    case 'movedTo':
      const doc = data[action.fromIndex]
      const copy = [
        ...data.slice(0, action.fromIndex),
        ...data.slice(action.fromIndex + 1)
      ]
      copy.splice(action.toIndex, 0, doc)
      return copy
  }
}

const checkCursor = <T>(cursor: Mongo.Cursor<T>) => {
  if (!(cursor instanceof Mongo.Cursor)) {
    console.warn(
      'Warning: useFind requires an instance of Mongo.Cursor. '
      + 'Make sure you do NOT call fetch() on your cursor.'
    );
  }
}

const useFindClient = <T = any>(factory: () => Mongo.Cursor<T>, deps: DependencyList) => {
  let [data, dispatch] = useReducer<Reducer<T[], useFindActions<T>>>(
    useFindReducer,
    []
  )

  const cursor = useMemo(() => (
    // To avoid creating side effects in render, opt out
    // of Tracker integration altogether.
    Tracker.nonreactive(() => {
      const c = factory()
      if (Meteor.isDevelopment) {
        checkCursor(c)
      }
      data = c.fetch()
      return c
    })
  ), deps)

  useEffect(() => {
    // Refetch the data in case an update happened
    // between first render and commit. Additionally,
    // update in response to deps change.
    const data = Tracker.nonreactive(() => cursor.fetch())

    dispatch({
      type: 'refresh',
      data: data
    })

    const observer = cursor.observe({
      addedAt (document, atIndex, before) {
        dispatch({ type: 'addedAt', document, atIndex })
      },
      changedAt (newDocument, oldDocument, atIndex) {
        dispatch({ type: 'changedAt', document: newDocument, atIndex })
      },
      removedAt (oldDocument, atIndex) {
        dispatch({ type: 'removedAt', atIndex })
      },
      movedTo (document, fromIndex, toIndex, before) {
        dispatch({ type: 'movedTo', fromIndex, toIndex })
      },
      // @ts-ignore
      _suppress_initial: true
    })

    return () => {
      observer.stop()
    }
  }, [cursor])

  return data
}

const useFindServer = <T = any>(factory: () => Mongo.Cursor<T>, deps: DependencyList) => (
  Tracker.nonreactive(() => {
    const cursor = factory()
    if (Meteor.isDevelopment) checkCursor(cursor)
    return cursor.fetch()
  })
)

export const useFind = Meteor.isServer
  ? useFindServer
  : useFindClient
