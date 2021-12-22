import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import React, { useState, useEffect, forwardRef } from 'react'

// Augmentation to add missing signature
declare module 'meteor/meteor' {
  module Meteor {
    function loggingOut(): boolean;
  }
}

/**
 * Hook to get a stateful value of the current user id. Uses `Meteor.userId`, a reactive data source.
 * @see https://docs.meteor.com/api/accounts.html#Meteor-userId
 */
export function useUserId() {
  const [userId, setUserId] = useState(Meteor.userId())
  useEffect(() => {
    const computation = Tracker.autorun(() => {
      setUserId(Meteor.userId())
    })
    return () => {
      computation.stop()
    }
  }, [])
  return userId
}

export interface WithUserIdProps {
  userId: string | null;
}

/**
 * HOC to forward a stateful value of the current user id. Uses `Meteor.userId`, a reactive data source.
 * @see https://docs.meteor.com/api/accounts.html#Meteor-userId
 */
export function withUserId<P>(Component: React.ComponentType<P>) {
  return forwardRef(
    // Use `Omit` so instantiation doesn't require the prop. Union with `Partial` because prop should be optionally overridable / the wrapped component will be prepared for it anyways.
    (props: Omit<P, keyof WithUserIdProps> & Partial<WithUserIdProps>, ref) => {
      const userId = useUserId();
      return (
        <Component
          // Cast because `P` may not include `userId`. TS forces cast to unknown first.
          {...({ userId } as unknown as P)}
          ref={ref}
          {...props}
        />
      );
    }
  );
}

/**
 * Hook to get a stateful value of the current user record. Uses `Meteor.user`, a reactive data source.
 * @see https://docs.meteor.com/api/accounts.html#Meteor-user
 */
export function useUser() {
  const [user, setUser] = useState(Meteor.user());
  useEffect(() => {
    const computation = Tracker.autorun(() => {
      let user = Meteor.user();
      // `Meteor.user` returns `undefined` after logout, but that ruins type signature and test parity. So, cast until that's fixed.
      if (user === undefined) {
        user = null;
      }
      setUser(user);
    });
    return () => {
      computation.stop();
    };
  }, []);
  return user;
}

export interface WithUserProps {
  user: Meteor.User;
}

/**
 * HOC to get a stateful value of the current user record. Uses `Meteor.user`, a reactive data source.
 * @see https://docs.meteor.com/api/accounts.html#Meteor-user
 */
export function withUser<P>(Component: React.ComponentType<P>) {
  return forwardRef(
    (props: Omit<P, keyof WithUserProps> & Partial<WithUserProps>, ref) => {
      const user = useUser();
      return <Component {...({ user } as unknown as P)} ref={ref} {...props} />;
    }
  );
}

/**
 * Hook to get a stateful value of whether a login method (e.g. `loginWith<Service>`) is currently in progress. Uses `Meteor.loggingIn`, a reactive data source.
 * @see https://docs.meteor.com/api/accounts.html#Meteor-loggingIn
 */
export function useLoggingIn(): boolean {
  const [loggingIn, setLoggingIn] = useState(Meteor.loggingIn());
  useEffect(() => {
    const computation = Tracker.autorun(() => {
      setLoggingIn(Meteor.loggingIn());
    });
    return () => {
      computation.stop();
    };
  }, []);
  return loggingIn;
}

export interface WithLoggingInProps {
  loggingIn: boolean;
}

/**
 * HOC to forward a stateful value of whether a login method (e.g. `loginWith<Service>`) is currently in progress. Uses `Meteor.loggingIn`, a reactive data source.
 * @see https://docs.meteor.com/api/accounts.html#Meteor-loggingIn
 */
export function withLoggingIn<P>(Component: React.ComponentType<P>) {
  return forwardRef(
    (
      props: Omit<P, keyof WithLoggingInProps> & Partial<WithLoggingInProps>,
      ref
    ) => {
      const loggingIn = useLoggingIn();
      return (
        <Component {...({ loggingIn } as unknown as P)} ref={ref} {...props} />
      );
    }
  );
}

/**
 * Hook to get a stateful value of whether the logout method is currently in progress. Uses `Meteor.loggingOut`, a reactive data source.
 */
export function useLoggingOut(): boolean {
  const [loggingOut, setLoggingOut] = useState(Meteor.loggingOut());
  useEffect(() => {
    const computation = Tracker.autorun(() => {
      setLoggingOut(Meteor.loggingOut());
    });
    return () => {
      computation.stop();
    };
  }, []);
  return loggingOut;
}

export interface WithLoggingOutProps {
  loggingOut: boolean;
}

/**
 * HOC to forward a stateful value of whether the logout method is currently in progress. Uses `Meteor.loggingOut`, a reactive data source.
 */
export function withLoggingOut<P>(Component: React.ComponentType<P>) {
  return forwardRef(
    (
      props: Omit<P, keyof WithLoggingOutProps> & Partial<WithLoggingOutProps>,
      ref
    ) => {
      const loggingOut = useLoggingOut();
      return (
        <Component {...({ loggingOut } as unknown as P)} ref={ref} {...props} />
      );
    }
  );
}
