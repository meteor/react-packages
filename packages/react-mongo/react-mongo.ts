import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Tracker } from 'meteor/tracker'
import { EJSON } from 'meteor/ejson'
import { useState, useEffect, useReducer, useRef, DependencyList, Reducer } from 'react'

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

const useSubscriptionClient = (name?: string, ...args: any[]): Meteor.SubscriptionHandle => {
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

  return {
    stop () {
      refs.subscription?.stop()
    },
    ready () {
      // Ready runs synchronously with render, should not create side effects.
      refs.updateOnReady = true
      return refs.isReady
    }
  }
}

const useSubscriptionServer = (): Meteor.SubscriptionHandle => ({
  stop() {},
  ready() { return true }
})

export const useSubscription = (name?: string, ...args: any[]) => (
  Meteor.isServer
    ? useSubscriptionServer()
    : useSubscriptionClient(name, ...args)
)

type useCursorActions<T> =
  | { type: 'refresh', data: T[] }
  | { type: 'addedAt', document: T, atIndex: number }
  | { type: 'changedAt', document: T, atIndex: number }
  | { type: 'removedAt', atIndex: number }
  | { type: 'movedTo', fromIndex: number, toIndex: number }

const useCursorReducer = <T>(data: T[], action: useCursorActions<T>): T[] => {
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

const useCursorClient = <T = any>(factory: () => Mongo.Cursor<T>, deps: DependencyList = []) => {
  const [data, dispatch] = useReducer<Reducer<T[], useCursorActions<T>>, T[]>(
    useCursorReducer,
    undefined,
    () => Tracker.nonreactive(() => {
      const cursor = factory()
      return cursor.fetch()
    })
  )

  useEffect(() => {
    // Rebuild the cursor and data in case an update may have
    // happened between first render and commit. Alternatively,
    // update in response to deps change.
    const [cursor, data] = Tracker.nonreactive(() => {
      const cursor = factory()
      return [ cursor, cursor.fetch() ]
    })
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
  }, deps)

  return data
}

const useCursorServer = <T = any>(factory: () => Mongo.Cursor<T>) => Tracker.nonreactive(() => factory().fetch())

export const useCursor = <T = any>(factory: () => Mongo.Cursor<T>, deps: DependencyList = []) => (
  Meteor.isServer
    ? useCursorServer(factory)
    : useCursorClient(factory, deps)
)

function useFind <T = any>(collection: Mongo.Collection<T>, query: any, deps: DependencyList): T[]
function useFind <T = any>(collection: Mongo.Collection<T>, query: any, options: any, deps: DependencyList): T[]
function useFind <T = any>(collection: Mongo.Collection<T>, query: any, ...rest): T[] {
  const deps: DependencyList = rest.pop()
  return useCursor(() => collection.find(query, rest[0]), [collection, ...deps])
}

function useFindOne <T = any>(collection: Mongo.Collection<T>, query: any, deps: DependencyList): T
function useFindOne <T = any>(collection: Mongo.Collection<T>, query: any, options: any, deps: DependencyList): T
function useFindOne <T = any>(collection: Mongo.Collection<T>, query: any, ...rest: any[]): T {
  const deps: DependencyList = rest.pop()
  const options = rest[0]
    ? { ...rest[0], limit: 1 }
    : { limit: 1 }
  return useCursor(() => collection.find(query, options), [collection, ...deps])[0]
}

function useCount <T = any>(collection: Mongo.Collection<T>, query: any, deps: DependencyList): number
function useCount <T = any>(collection: Mongo.Collection<T>, query: any, options: any, deps: DependencyList): number
function useCount <T = any>(collection: Mongo.Collection<T>, query: any, ...rest: any[]): number {
  const deps: DependencyList = rest.pop()

  const [count, setCount] = useState(() =>
    Tracker.nonreactive(() =>
      collection.find(query, rest[0]).count()
    )
  )

  useEffect(() => {
    const computation = Tracker.nonreactive(() => (
      Tracker.autorun(() => {
        setCount(collection.find(query, rest[0]).count())
      })
    ))
    return () => {
      computation.stop()
    }
  })

  return count
}

export {
  useFind,
  useFindOne,
  useCount
}
