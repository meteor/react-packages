import * as React from 'react';
import { Mongo } from 'meteor/mongo';
import { EJSON } from "meteor/ejson";
import { Meteor } from "meteor/meteor";

export function useTracker<TDataProps>(reactiveFn: () => TDataProps): TDataProps
export function useTracker<TDataProps>(reactiveFn: () => TDataProps, deps: React.DependencyList): TDataProps;
export function useTracker<TDataProps>(
  getMeteorData: () => TDataProps,
  deps: React.DependencyList,
  skipUpdate?: (prev: TDataProps, next: TDataProps) => boolean
): TDataProps;
export function useTracker<TDataProps>(
  getMeteorData: () => TDataProps,
  skipUpdate: (prev: TDataProps, next: TDataProps) => boolean
): TDataProps;

export function withTracker<TDataProps, TOwnProps>(
  reactiveFn: (props: TOwnProps) => TDataProps
): (reactComponent: React.ComponentType<TOwnProps & TDataProps>) => React.ComponentClass<TOwnProps>;
export function withTracker<TDataProps, TOwnProps>(options: {
  getMeteorData: (props: TOwnProps) => TDataProps;
  pure?: boolean | undefined;
  skipUpdate?: (prev: TDataProps, next: TDataProps) => boolean;
}): (reactComponent: React.ComponentType<TOwnProps & TDataProps>) => React.ComponentClass<TOwnProps>;

export function useSubscribe(name?: string, ...args: any[]): () => boolean;

// Suspense
export function useSubscribe(name: string, ...params: EJSON[]) : Meteor.SubscriptionHandle;

export function useFind<T>(factory: () => Mongo.Cursor<T>, deps?: React.DependencyList): T[];
export function useFind<T>(factory: () => Mongo.Cursor<T> | undefined | null, deps?: React.DependencyList): T[] | null;

// Suspense
export function useFind<T>(collection : Mongo.Collection<T>, findArgs: Parameters<Mongo.Collection<T>['find']> | null): T[] | null

