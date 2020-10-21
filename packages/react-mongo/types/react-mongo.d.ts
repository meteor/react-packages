import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { DependencyList } from 'react';
export declare const useSubscription: (factory: () => Meteor.SubscriptionHandle, deps?: DependencyList) => Meteor.SubscriptionHandle;
export declare const useCursor: <T = any>(factory: () => Mongo.Cursor<T>, deps?: DependencyList) => Mongo.Cursor<T>;
