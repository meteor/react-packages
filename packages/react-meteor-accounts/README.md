# react-meteor-accounts

Simple hooks and higher-order components (HOCs) for getting reactive, stateful values of Meteor's Accounts data sources.

## Table of Contents

- [Installation](#installation)
  - [Peer npm dependencies](#peer-npm-dependencies)
  - [Changelog](#changelog)
- [Usage](#usage)
  - [`useUser` / `withUser`](#useuser--withUser)
  - [`useUserId` / `withUserId`](#useuserid--withUserId)

## Installation

Install the package from Atmosphere:

```shell
meteor add react-meteor-accounts
```

### Peer npm dependencies

Install React if you have not already:

```shell
meteor npm install react
```

_Note:_ The minimum supported version of React is v16.8 ("the one with hooks").

### Changelog

For recent changes, check the [changelog](./CHANGELOG.md).

## Usage

Utilities for each data source are available for the two ways of writing React components: hooks and higher-order components (HOCs). Hooks can only be used in functional components. HOCs can be used for both functional and class components, but are primarily for the latter.

_Note:_ All HOCs forward refs.

### useUser() / withUser(...)

Get a stateful value of the current user record. Uses [`Meteor.user`](https://docs.meteor.com/api/accounts.html#Meteor-user), a reactive data source.

The hook, `useUser()`, returns a stateful value of the current user record.

- Arguments: *none*.
- Returns: `object | null`.

The HOC, `withUser(Component)`, returns a wrapped version of `Component`, where `Component` receives a prop of the current user record, `user`.

- Arguments:

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| Component | `any` | yes | A React component. |

- Returns: `React.ForwardRefExoticComponent`.

Examples:

```tsx
import React from 'react';
import { useUser, withUser } from 'meteor/react-meteor-accounts';

// Hook
function Foo() {
  const user = useUser();

  if (user === null) {
    return <h1>Log in</h1>;
  }

  return <h1>Hello {user.username}</h1>;
}

// HOC
class Bar extends React.Component {
  render() {
    if (this.props.user === null) {
      return <h1>Log in</h1>;
    }

    return <h1>Hello {this.props.user.username}</h1>;
  }
}

const WrappedBar = withUser(Bar);
```

TypeScript signatures:

```ts
// Hook
function useUser(): Meteor.User | null;

// HOC
function withUser<P>(Component: React.ComponentType<P>): React.ForwardRefExoticComponent<React.PropsWithoutRef<Omit<P, "user"> & Partial<WithUserProps>> & React.RefAttributes<unknown>>;
```

### useUserId() / withUserId(...)

Get a stateful value of the current user id. Uses [`Meteor.userId`](https://docs.meteor.com/api/accounts.html#Meteor-userId), a reactive data source.

The hook, `useUserId()`, returns a stateful value of the current user id.

- Arguments: *none*.
- Returns: `string | null`.

The HOC, `withUserId(Component)`, returns a wrapped version of `Component`, where `Component` receives a prop of the current user id, `userId`.

- Arguments:

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| Component | `React.ComponentType` | yes | A React component. |

- Returns: `React.ForwardRefExoticComponent`.

Examples:

```tsx
import React from 'react';
import { useUserId, withUserId } from 'meteor/react-meteor-accounts';

// Hook
function Foo() {
  const userId = useUserId();

  return (
    <div>
      <h1>Account Details</h1>
      {userId ? (
          <p>Your unique account id is {userId}.</p>
        ) : (
          <p>Log-in to view your account details.</p>
        )}
    </div>
  );
}

// HOC
class Bar extends React.Component {
  render() {
    return (
      <div>
        <h1>Account Details</h1>
        {this.props.userId ? (
            <p>Your unique account id is {this.props.userId}.</p>
          ) : (
            <p>Log-in to view your account details.</p>
          )}
      </div>
    );
  }
}

const WrappedBar = withUserId(Bar);
```

TypeScript signatures:

```ts
// Hook
function useUserId(): string | null;

// HOC
function withUserId<P>(Component: React.ComponentType<P>): React.ForwardRefExoticComponent<React.PropsWithoutRef<Omit<P, "userId"> & Partial<WithUserIdProps>> & React.RefAttributes<unknown>>;
```

### useLoggingIn() / withLoggingIn(...)

Get a stateful value of whether a login method (e.g. `loginWith<Service>`) is currently in progress. Uses [`Meteor.loggingIn`](https://docs.meteor.com/api/accounts.html#Meteor-loggingIn), a reactive data source.

The hook, `useLoggingIn()`, returns the stateful value.

- Arguments: *none*.
- Returns: `boolean`.

The HOC, `withLoggingIn(Component)`, returns a wrapped version of `Component`, where `Component` receives a prop of the stateful value, `loggingIn`.

- Arguments:

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| Component | `React.ComponentType` | yes | A React component. |

- Returns: `React.ForwardRefExoticComponent`.

Examples:

```tsx
import React from 'react';
import { useLoggingIn, withLoggingIn } from 'meteor/react-meteor-accounts';

// Hook
function Foo() {
  const loggingIn = useLoggingIn();

  if (!loggingIn) {
    return null;
  }

  return (
    <div>Logging in, please wait a moment.</div>
  );
}

// HOC
class Bar extends React.Component {
  render() {
    if (!this.props.loggingIn) {
      return null;
    }

    return (
      <div>Logging in, please wait a moment.</div>
    );
  }
}

const BarWithLoggingIn = withLoggingIn(Bar);
```

TypeScript signatures:

```ts
// Hook
function useLoggingIn(): boolean;

// HOC
function withLoggingIn<P>(Component: React.ComponentType<P>): React.ForwardRefExoticComponent<React.PropsWithoutRef<Omit<P, "loggingIn"> & Partial<WithLoggingInProps>> & React.RefAttributes<unknown>>;
```

### useLoggingOut() / withLoggingOut(...)

Get a stateful value of whether the logout method is currently in progress. Uses `Meteor.loggingOut` (no online documentation), a reactive data source.

The hook, `useLoggingOut()`, returns the stateful value.

- Arguments: *none*.
- Returns: `boolean`.

The HOC, `withLoggingOut(Component)`, returns a wrapped version of `Component`, where `Component` receives a prop of the stateful value, `loggingOut`.

- Arguments:

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| Component | `React.ComponentType` | yes | A React component. |

- Returns: `React.ForwardRefExoticComponent`.

Examples:

```tsx
import React from 'react';
import { useLoggingOut, withLoggingOut } from 'meteor/react-meteor-accounts';

// Hook
function Foo() {
  const loggingOut = useLoggingOut();

  if (!loggingOut) {
    return null;
  }

  return (
    <div>Logging out in, please wait a moment.</div>
  );
}

// HOC
class Bar extends React.Component {
  render() {
    if (!this.props.loggingOut) {
      return null;
    }

    return (
      <div>Logging out, please wait a moment.</div>
    );
  }
}

const BarWithLoggingOut = withLoggingOut(Bar);
```

TypeScript signatures:

```ts
// Hook
function useLoggingOut(): boolean;

// HOC
function withLoggingOut<P>(Component: React.ComponentType<P>): React.ForwardRefExoticComponent<React.PropsWithoutRef<Omit<P, "loggingOut"> & Partial<WithLoggingOutProps>> & React.RefAttributes<unknown>>;
```
