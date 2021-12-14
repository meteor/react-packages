import { Meteor } from 'meteor/meteor';
import React from 'react';
export declare function useUserId(): string | null;
export declare function withUserId<P>(Component: React.ComponentType<P>): React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<unknown>>;
export declare function useUser(): Meteor.User | null;
export declare function withUser<P>(Component: React.ComponentType<P>): React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<unknown>>;
