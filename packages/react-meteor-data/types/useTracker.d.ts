/// <reference types="meteor" />
import { Tracker } from 'meteor/tracker';
import { DependencyList } from 'react';
declare type ReactiveFn = (c?: Tracker.Computation) => any;
declare const _default: <T = any>(reactiveFn: () => T, deps: DependencyList) => T;
export default _default;
export declare const useTrackerLegacy: ((reactiveFn: ReactiveFn) => any) | (<T = any>(reactiveFn: () => T, deps: DependencyList) => T);
