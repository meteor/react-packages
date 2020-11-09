import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Tracker } from 'meteor/tracker'
import { EJSON } from 'meteor/ejson'
import { useEffect, useMemo, useReducer, useRef, DependencyList } from 'react'

const fur = (x: number): number => x + 1
const useForceUpdate = () => useReducer(fur, 0)[1]

type useSubscriptionRefs = {
  facade: Meteor.SubscriptionHandle,
  subscription?: Meteor.SubscriptionHandle,
  computation?: Tracker.Computation,
  updateOnReady: boolean,
  isReady: boolean,
  params: {
    name?: string,
    args: any[]
  }
}

const useSubscriptionClient = (name?: string, ...args: any[]) => {
  const forceUpdate = useForceUpdate()

  const ref = useRef<useSubscriptionRefs>({
    facade: {
      stop () {
        refs.subscription?.stop()
      },
      ready () {
        // Ready runs synchronously with render, and should not
        // create side effects.
        refs.updateOnReady = true

        return (refs.subscription && EJSON.equals(refs.params, { name, args }))
          ? refs.isReady
          : false
      }
    },
    updateOnReady: false,
    isReady: false,
    params: {
      name,
      args
    }
  })
  const refs: useSubscriptionRefs = ref.current

  if (!EJSON.equals(refs.params, { name, args })) {
    refs.updateOnReady = false
    refs.isReady = false
  }

  useEffect(() => {
    refs.computation = Tracker.nonreactive(() => (
      Tracker.autorun(() => {
        refs.subscription = name && Meteor.subscribe(name, ...args)
        if (!refs.subscription) return

        const isReady = refs.subscription.ready()
        if (isReady !== refs.isReady) {
          refs.isReady = isReady
          if (refs.updateOnReady) forceUpdate()
        }
      })
    ))

    refs.params = { name, args }

    return () => {
      refs.computation.stop()
      refs.subscription = null
    }
  }, [name, ...args])

  return refs.facade
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
