import { Mongo } from 'meteor/mongo';
import { DependencyList } from 'react';
declare type UseSubscriptionOptions = {
    deps?: DependencyList;
    updateOnReady?: boolean;
};
export declare const useSubscription: (name: string | false, args: any[]) => () => boolean;
export declare const useCursor: <T = any>(factory: () => Mongo.Cursor<T>, deps?: DependencyList) => Mongo.Cursor<T>;
export {};
