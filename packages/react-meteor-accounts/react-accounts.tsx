import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import React, { useState, useEffect, forwardRef } from 'react'

// Augmentation to add missing signature
declare module 'meteor/meteor' {
  module Meteor {
    function loggingOut(): boolean;
  }
}

/**
 * Hook to get a stateful value of the current user id. Uses `Meteor.userId`, a reactive data source.
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
 * HOC to forward a stateful value of the current user id. Uses `Meteor.userId`, a reactive data source.
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
 * Hook to get a stateful value of the current user record. Uses `Meteor.user`, a reactive data source.
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
 * HOC to get a stateful value of the current user record. Uses `Meteor.user`, a reactive data source.
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

/**
 * Hook to get a stateful value of whether a login method (e.g. `loginWith<Service>`) is currently in progress. Uses `Meteor.loggingIn`, a reactive data source.
 * @see https://docs.meteor.com/api/accounts.html#Meteor-loggingIn
 */
export function useLoggingIn(): boolean {
  const [loggingIn, setLoggingIn] = useState(Meteor.loggingIn())
  useEffect(() => {
    const computation = Tracker.autorun(() => {
      setLoggingIn(Meteor.loggingIn())
    })
    return () => {
      computation.stop()
    }
  }, [])
  return loggingIn
}

/**
 * HOC to forward a stateful value of whether a login method (e.g. `loginWith<Service>`) is currently in progress. Uses `Meteor.loggingIn`, a reactive data source.
 * @see https://docs.meteor.com/api/accounts.html#Meteor-loggingIn
 */
export function withLoggingIn<P extends {
  loggingIn: boolean
}>(Component: React.ComponentType<P>) {
  return forwardRef((props: P, ref) => {
    const loggingIn = useLoggingIn();
    return <Component loggingIn={loggingIn} ref={ref} {...props} />
  })
}

/**
 * Hook to get a stateful value of whether the logout method is currently in progress. Uses `Meteor.loggingOut`, a reactive data source.
 */
export function useLoggingOut(): boolean {
  const [loggingOut, setLoggingOut] = useState(Meteor.loggingOut())
  useEffect(() => {
    const computation = Tracker.autorun(() => {
      setLoggingOut(Meteor.loggingOut())
    })
    return () => {
      computation.stop()
    }
  }, [])
  return loggingOut
}

/**
 * HOC to forward a stateful value of whether the logout method is currently in progress. Uses `Meteor.loggingOut`, a reactive data source.
 */
export function withLoggingOut<P extends {
  loggingIn: boolean
}>(Component: React.ComponentType<P>) {
  return forwardRef((props: P, ref) => {
    const loggingOut = useLoggingOut();
    return <Component loggingOut={loggingOut} ref={ref} {...props} />
  })
}
