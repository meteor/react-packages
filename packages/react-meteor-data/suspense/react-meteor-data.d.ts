// Suspense
import { type Mongo } from 'meteor/mongo'
import { type EJSON } from 'meteor/ejson'
import { type Meteor } from 'meteor/meteor'

export function useFind<T> (key: string, collection: Mongo.Collection<T>, findArgs: Parameters<Mongo.Collection<T>['find']> | null): T[] | null

export function useSubscribe (name: string, ...params: EJSON[]): Meteor.SubscriptionHandle
