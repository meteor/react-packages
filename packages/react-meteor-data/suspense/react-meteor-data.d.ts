// Suspense
import { type Mongo } from 'meteor/mongo'
import { type EJSON } from 'meteor/ejson'
import { type Meteor } from 'meteor/meteor'
import type * as React from 'react'

export function useTracker<TDataProps>(
  key: string,
  reactiveFn: () => Promise<TDataProps>
): TDataProps
export function useTracker<TDataProps>(
  key: string,
  reactiveFn: () => Promise<TDataProps>,
  deps: React.DependencyList
): TDataProps
export function useTracker<TDataProps>(
  key: string,
  getMeteorData: () => Promise<TDataProps>,
  deps: React.DependencyList,
  skipUpdate?: (prev: Promise<TDataProps>, next: Promise<TDataProps>) => boolean
): TDataProps
export function useTracker<TDataProps>(
  key: string,
  getMeteorData: () => Promise<TDataProps>,
  skipUpdate: (prev: Promise<TDataProps>, next: Promise<TDataProps>) => boolean
): TDataProps

export function useFind<T>(collection: Mongo.Collection<T>, findArgs: Parameters<Mongo.Collection<T>['find']> | null): T[] | null

export function useSubscribe(name: string, ...params: EJSON[]): Meteor.SubscriptionHandle
