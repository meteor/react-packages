import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Tracker } from 'meteor/tracker'
import { EJSON } from 'meteor/ejson'
import { useEffect, useMemo, useReducer, useRef, DependencyList } from 'react'

const fur = (x: number): number => x + 1
const useForceUpdate = () => useReducer(fur, 0)[1]

type useSubscriptionRefs = {
  subscription?: Meteor.SubscriptionHandle,
  computation?: Tracker.Computation,
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
        if (!name) {
          refs.subscription = null
          return
        }

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

    refs.computation = computation

    return () => {
      computation.stop()
      refs.subscription = null
    }
  }, [name, ...args])

  return {
    stop () {
      refs.subscription?.stop()
    },
    ready () {
      // Ready runs synchronously with render, should not create side effects.
      refs.updateOnReady = true
      return (refs.subscription && EJSON.equals(refs.params, { name, args }))
        ? refs.isReady
        : false
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
