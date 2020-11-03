import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { DependencyList } from 'react';
declare type UseSubscriptionOptions = {
    deps?: DependencyList;
    updateOnReady?: boolean;
};
export declare const useSubscription: (factory: () => Meteor.SubscriptionHandle | void, deps?: DependencyList | UseSubscriptionOptions) => void;
export declare const useCursor: <T = any>(factory: () => Mongo.Cursor<T>, deps?: DependencyList) => Mongo.Cursor<T>;
export {};
