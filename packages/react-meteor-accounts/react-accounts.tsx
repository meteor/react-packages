import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import React, { useState, useEffect, forwardRef } from 'react'

/**
 * Hook to get a stateful value of the current user id from `Meteor.userId`, a reactive data source.
 * @see https://docs.meteor.com/api/accounts.html#Meteor-userId
 */
export function useUserId(): string | null {
  const [userId, setUserId] = useState(Meteor.userId())
  useEffect(() => {
    const computation = Tracker.autorun(() => {
      setUserId(Meteor.userId())
    })
    return () => {
      computation.stop()
    }
  }, [])
  return userId
}

/**
 * HOC to forward a stateful value of the current user id from `Meteor.userId`, a reactive data source.
 * @see https://docs.meteor.com/api/accounts.html#Meteor-userId
 */
export function withUserId<P extends {
  userId: string | null
}>(Component: React.ComponentType<P>) {
  return forwardRef((props: P, ref) => {
    const userId = useUserId();
    return <Component userId={userId} ref={ref} {...props} />
  })
}

/**
 * Hook to get a stateful value of the current user record from `Meteor.user`, a reactive data source.
 * @see https://docs.meteor.com/api/accounts.html#Meteor-user 
 */
export function useUser(): Meteor.User | null {
  const [user, setUser] = useState(Meteor.user())
  useEffect(() => {
    const computation = Tracker.autorun(() => {
      setUser(Meteor.user())
    })
    return () => {
      computation.stop()
    }
  }, [])
  return user
}

/**
 * HOC to get a stateful value of the current user record from `Meteor.user`, a reactive data source.
 * @see https://docs.meteor.com/api/accounts.html#Meteor-user 
 */
export function withUser<P extends {
  user: Meteor.User | null
}>(Component: React.ComponentType<P>) {
  return forwardRef((props: P, ref) => {
    const user = useUser();
    return <Component user={user} ref={ref} {...props} />
  })
}
