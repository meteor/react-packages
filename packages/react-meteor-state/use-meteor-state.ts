import { Meteor } from 'meteor/meteor'
import { Reload } from 'meteor/reload'
import { useState, useEffect, SetStateAction, Dispatch } from 'react'

interface IHash {
  [key: string] : any
}

if (Meteor.isClient) {
  var toMigrate: IHash = {}
  var migrated: IHash = Reload._migrationData('use-meteor-state') || {}

  Reload._onMigrate('use-meteor-state', () => [true, toMigrate])
}

const useMeteorState = <S>(initialValue: S | (() => S), name: string): [S, Dispatch<SetStateAction<S>>] => {
  // When running in concurrent mode, this may run multiple times ...
  if (migrated[name]) {
    initialValue = migrated[name]
  }

  useEffect(() => {
    // ... so cleanup happens only after the render is committed
    if (migrated[name]) {
      // move to toMigrate for next refresh
      toMigrate[name] = migrated[name]
      delete migrated[name]
    }
    return () => {
      // Remove migration on unmount
      if (toMigrate[name]) {
        delete toMigrate[name]
      }
    }
  }, [name])

  const [value, setValue] = useState(initialValue)

  return [value, (value: S) => {
    toMigrate[name] = value
    setValue(value)
  }]
}

export default Meteor.isClient
  ? useMeteorState
  : useState
