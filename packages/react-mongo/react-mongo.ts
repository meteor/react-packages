import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Tracker } from 'meteor/tracker'
import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useCallback,
  DependencyList,
} from 'react'

const fur = (x: number): number => x + 1
const useForceUpdate = () => useReducer(fur, 0)[1]

const useSubscriptionClient = (
  name: string | false,
  args: any[]
) => {
  const subscription = useRef<Meteor.SubscriptionHandle>()

  useEffect(() => {
    if (!name) {
      subscription.current = null
      return
    }

    // Use Tracker.nonreactive in case we are inside a Tracker Computation.
    // This can happen if someone calls `ReactDOM.render` inside a Computation.
    // In that case, we want to opt out of the normal behavior of nested
    // Computations, where if the outer one is invalidated or stopped,
    // it stops the inner one.
    const computation = Tracker.nonreactive(() => (
      Tracker.autorun(() => {
        subscription.current = Meteor.subscribe( name, ...args )
        // @ts-ignore this is just an internal thing
        subscription.current.deps = { name, args }
      })
    ))

    return () => computation.stop()
  }, [name, ...args])

  return useCallback(
    () => {
      if (subscription.current) {
        // @ts-ignore
        const { deps } = subscription.current
        if (deps.name === name && deps.args === args) {
          return subscription.current.ready()
        } else {
          // Prevented returning the previous subscription's status
        }
      }

      return false
    },
    [name, ...args]
  )
}

const useSubscriptionServer = (): Meteor.SubscriptionHandle => ({
  stop() {},
  ready() { return true }
})

export const useSubscription = (name: string | false, ...args: any[]) => (
  Meteor.isServer
    ? useSubscriptionServer()
    : useSubscriptionClient(name, args)
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
