/// <reference types="react" />
import { Meteor } from 'meteor/meteor';
export declare const useUserId: () => string;
export declare const withUserId: (Component: any) => import("react").ForwardRefExoticComponent<import("react").RefAttributes<unknown>>;
export declare const useUser: () => Meteor.User;
export declare const withUser: (Component: any) => import("react").ForwardRefExoticComponent<import("react").RefAttributes<unknown>>;
