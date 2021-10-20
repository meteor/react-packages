import { Meteor } from 'meteor/meteor'
import useTracker from './useTracker'

const useSubscribeClient = (name?: string, ...args: any[]): () => boolean => {
  let updateOnReady = false
  let subscription: Meteor.SubscriptionHandle

  const isReady = useTracker(() => {
    if (!name) return true

    subscription = Meteor.subscribe(name, ...args)

    return subscription.ready()
  }, () => (!updateOnReady))

  return () => {
    updateOnReady = true
    return !isReady
  }
}

const useSubscribeServer = (name?: string, ...args: any[]): () => boolean => (
  () => false
)

export const useSubscribe = Meteor.isServer
  ? useSubscribeServer
  : useSubscribeClient
