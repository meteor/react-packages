import type * as React from 'react'
import { type Mongo } from 'meteor/mongo'

export function useTracker<TDataProps>(
  reactiveFn: () => TDataProps
): TDataProps
export function useTracker<TDataProps>(
  reactiveFn: () => TDataProps,
  deps: React.DependencyList
): TDataProps
export function useTracker<TDataProps>(
  getMeteorData: () => TDataProps,
  deps: React.DependencyList,
  skipUpdate?: (prev: TDataProps, next: TDataProps) => boolean
): TDataProps
export function useTracker<TDataProps>(
  getMeteorData: () => TDataProps,
  skipUpdate: (prev: TDataProps, next: TDataProps) => boolean
): TDataProps

export function withTracker<TDataProps, TOwnProps>(
  reactiveFn: (props: TOwnProps) => TDataProps
): (
  reactComponent: React.ComponentType<TOwnProps & TDataProps>
) => React.ComponentClass<TOwnProps>
export function withTracker<TDataProps, TOwnProps>(options: {
  getMeteorData: (props: TOwnProps) => TDataProps
  pure?: boolean | undefined
  skipUpdate?: (prev: TDataProps, next: TDataProps) => boolean
}): (
  reactComponent: React.ComponentType<TOwnProps & TDataProps>
) => React.ComponentClass<TOwnProps>

export function useSubscribe(name?: string, ...args: any[]): () => boolean

export function useFind<T>(
  factory: () => Mongo.Cursor<T>,
  deps?: React.DependencyList
): T[]
export function useFind<T>(
  factory: () => Mongo.Cursor<T> | undefined | null,
  deps?: React.DependencyList
): T[] | null
