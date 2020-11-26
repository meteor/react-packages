import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { DependencyList } from 'react';
export declare const useSubscription: (name?: string, ...args: any[]) => [() => boolean, Meteor.SubscriptionHandle | undefined];
export declare const useFind: <T = any>(factory: () => Mongo.Cursor<T>, deps: DependencyList) => T[];
