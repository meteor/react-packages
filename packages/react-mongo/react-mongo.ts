import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Tracker } from 'meteor/tracker'
import { useEffect, useMemo, useReducer, useRef, DependencyList } from 'react'

const fur = (x: number): number => x + 1
const useForceUpdate = () => useReducer(fur, 0)[1]

const useSubscriptionClient = (factory: () => Meteor.SubscriptionHandle, deps: DependencyList = []) => {
  const forceUpdate = useForceUpdate()
  const subscription = useRef<Meteor.SubscriptionHandle>({
    stop() {},
    ready: () => false
  })

  useEffect(() => {
    const computation = Tracker.autorun(() => {
      subscription.current = factory()
      if (subscription.current.ready()) forceUpdate()
    })

    return () => {
      computation.stop()
    }
  }, deps)

  return subscription.current
}

const useSubscriptionServer = (): Meteor.SubscriptionHandle => ({
  stop() {},
  ready() { return true }
})

export const useSubscription = (factory: () => Meteor.SubscriptionHandle, deps: DependencyList = []) => (
  Meteor.isServer
    ? useSubscriptionServer()
    : useSubscriptionClient(factory, deps)
)

const useCursorClient = <T = any>(factory: () => Mongo.Cursor<T>, deps: DependencyList = []) => {
  const cursor = useMemo<Mongo.Cursor<T>>(() => Tracker.nonreactive(factory), deps)
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    const observer = cursor.observeChanges({
      added: forceUpdate,
      changed: forceUpdate,
      removed: forceUpdate
    })

    // an update may have happened between first render and commit
    forceUpdate()

    return () => {
      observer.stop()
    }
  }, [cursor])

  return cursor
}

const useCursorServer = <T = any>(factory: () => Mongo.Cursor<T>) => Tracker.nonreactive(factory)

export const useCursor = <T = any>(factory: () => Mongo.Cursor<T>, deps: DependencyList = []) => (
  Meteor.isServer
    ? useCursorServer(factory)
    : useCursorClient(factory, deps)
)
