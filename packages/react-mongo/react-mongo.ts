import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Tracker } from 'meteor/tracker'
import { useEffect, useMemo, useReducer, useRef, DependencyList } from 'react'

const fur = (x: number): number => x + 1
const useForceUpdate = () => useReducer(fur, 0)[1]

const useSubscriptionClient = (factory: () => Meteor.SubscriptionHandle | void | false, deps: DependencyList= []) => {
  const forceUpdate = useForceUpdate()
  const { current: refs } = useRef<{
    handle?: Meteor.SubscriptionHandle,
    updateOnReady: boolean
  }>({
    handle: {
      stop () {
        refs.handle?.stop()
      },
      ready () {
        refs.updateOnReady = true
        return refs.handle?.ready()
      }
    },
    updateOnReady: false
  })

  useEffect(() => {
    // Use Tracker.nonreactive in case we are inside a Tracker Computation.
    // This can happen if someone calls `ReactDOM.render` inside a Computation.
    // In that case, we want to opt out of the normal behavior of nested
    // Computations, where if the outer one is invalidated or stopped,
    // it stops the inner one.
    const computation = Tracker.nonreactive(() => (
      Tracker.autorun(() => {
        refs.handle = factory()
        if (!refs.handle) return
        if (refs.updateOnReady && refs.handle.ready()) {
          forceUpdate()
        }
      })
    ))

    return () => {
      computation.stop()
    }
  }, deps)

  return refs.handle
}

const useSubscriptionServer = (): Meteor.SubscriptionHandle => ({
  stop() {},
  ready() { return true }
})

export const useSubscription = (factory: () => Meteor.SubscriptionHandle | void | false, deps: DependencyList = []) => (
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
