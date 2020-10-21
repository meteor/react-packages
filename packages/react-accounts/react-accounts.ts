import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { useState, useEffect } from 'react'

export const useUserId = () => {
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

export const useUser = () => {
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
