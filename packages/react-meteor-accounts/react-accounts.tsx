import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import React, { useState, useEffect, forwardRef } from 'react'

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

export function withUserId<P>(Component: React.ComponentType<P>) {
  return forwardRef((props: P, ref) => {
    const userId = useUserId();
    return <Component ref={ref} {...props} userId={userId} />
  })
}

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

export function withUser<P>(Component: React.ComponentType<P>) {
  return forwardRef((props: P, ref) => {
    const user = useUser();
    return <Component ref={ref} {...props} user={user} />
  })
}
