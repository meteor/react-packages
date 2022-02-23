# react-meteor-accounts

Simple hooks and higher-order components (HOCs) for getting reactive, stateful values of Meteor's Accounts data sources.

## Table of Contents

- [Installation](#installation)
  - [Peer npm dependencies](#peer-npm-dependencies)
  - [Changelog](#changelog)
- [Usage](#usage)
  - [`useUser`](#useuser)
  - [`useUserId`](#useuserid)
  - [`useLoggingIn`](#useloggingin)
  - [`useLoggingOut`](#useloggingout)
  - [`withUser`](#withuser)
  - [`withUserId`](#withuserid)
  - [`withLoggingIn`](#withloggingin)
  - [`withLoggingOut`](#withloggingout)

## Installation

Install the package from Atmosphere:

```shell
meteor add mdg:react-meteor-accounts
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

### useUser()

Get a stateful value of the current user record. A hook. Uses [`Meteor.user`](https://docs.meteor.com/api/accounts.html#Meteor-user), a reactive data source.

- Arguments: *none*.
- Returns: `object | null`.

Example:

```tsx
import React from 'react';
import { useUser } from 'meteor/mdg:react-meteor-accounts';

function Foo() {
  const user = useUser();

  if (user === null) {
    return <h1>Log in</h1>;
  }

  return <h1>Hello {user.username}</h1>;
}
```

TypeScript signature:

```ts
function useUser(): Meteor.User | null;
```

### useUserId()

Get a stateful value of the current user id. A hook. Uses [`Meteor.userId`](https://docs.meteor.com/api/accounts.html#Meteor-userId), a reactive data source. 

- Arguments: *none*.
- Returns: `string | null`.

Example:

```tsx
import React from 'react';
import { useUserId } from 'meteor/mdg:react-meteor-accounts';

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
```

TypeScript signature:

```ts
function useUserId(): string | null;
```

### useLoggingIn()

Get a stateful value of whether a login method (e.g. `loginWith<Service>`) is currently in progress. A hook. Uses [`Meteor.loggingIn`](https://docs.meteor.com/api/accounts.html#Meteor-loggingIn), a reactive data source.

- Arguments: *none*.
- Returns: `boolean`.

Example:

```tsx
import React from 'react';
import { useLoggingIn } from 'meteor/mdg:react-meteor-accounts';

function Foo() {
  const loggingIn = useLoggingIn();

  if (!loggingIn) {
    return null;
  }

  return (
    <div>Logging in, please wait a moment.</div>
  );
}
```

TypeScript signature:

```ts
function useLoggingIn(): boolean;
```

### useLoggingOut()

Get a stateful value of whether the logout method is currently in progress. A hook. Uses `Meteor.loggingOut` (no online documentation), a reactive data source.

- Arguments: *none*.
- Returns: `boolean`.

Example:

```tsx
import React from 'react';
import { useLoggingOut } from 'meteor/mdg:react-meteor-accounts';

function Foo() {
  const loggingOut = useLoggingOut();

  if (!loggingOut) {
    return null;
  }

  return (
    <div>Logging out, please wait a moment.</div>
  );
}
```

TypeScript signature:

```ts
function useLoggingOut(): boolean;
```

### withUser(...)

Return a wrapped version of the given component, where the component receives a stateful prop of the current user record, `user`. A higher-order component. Uses [`Meteor.user`](https://docs.meteor.com/api/accounts.html#Meteor-user), a reactive data source. 

- Arguments:

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| Component | `React.ComponentType` | yes | A React component. |

- Returns: `React.ForwardRefExoticComponent`.

Examples:

```tsx
import React from 'react';
import { withUser } from 'meteor/mdg:react-meteor-accounts';

class Foo extends React.Component {
  render() {
    if (this.props.user === null) {
      return <h1>Log in</h1>;
    }

    return <h1>Hello {this.props.user.username}</h1>;
  }
}

const FooWithUser = withUser(Foo);
```

TypeScript signature:

```ts
function withUser<P>(Component: React.ComponentType<P>): React.ForwardRefExoticComponent<React.PropsWithoutRef<Omit<P, "user"> & Partial<WithUserProps>> & React.RefAttributes<unknown>>;
```

### withUserId(...)

Return a wrapped version of the given component, where the component receives a stateful prop of the current user id. A higher-order component. Uses [`Meteor.userId`](https://docs.meteor.com/api/accounts.html#Meteor-userId), a reactive data source.

- Arguments:

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| Component | `React.ComponentType` | yes | A React component. |

- Returns: `React.ForwardRefExoticComponent`.

Example:

```tsx
import React from 'react';
import { withUserId } from 'meteor/mdg:react-meteor-accounts';

class Foo extends React.Component {
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

const FooWithUserId = withUserId(Foo);
```

TypeScript signature:

```ts
function withUserId<P>(Component: React.ComponentType<P>): React.ForwardRefExoticComponent<React.PropsWithoutRef<Omit<P, "userId"> & Partial<WithUserIdProps>> & React.RefAttributes<unknown>>;
```

### withLoggingIn(...)

Return a wrapped version of the given component, where the component receives a stateful prop of whether a login method (e.g. `loginWith<Service>`) is currently in progress. A higher-order component. Uses [`Meteor.loggingIn`](https://docs.meteor.com/api/accounts.html#Meteor-loggingIn), a reactive data source.

- Arguments:

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| Component | `React.ComponentType` | yes | A React component. |

- Returns: `React.ForwardRefExoticComponent`.

Example:

```tsx
import React from 'react';
import { withLoggingIn } from 'meteor/mdg:react-meteor-accounts';

class Foo extends React.Component {
  render() {
    if (!this.props.loggingIn) {
      return null;
    }

    return (
      <div>Logging in, please wait a moment.</div>
    );
  }
}

const FooWithLoggingIn = withLoggingIn(Foo);
```

TypeScript signatures:

```ts
function withLoggingIn<P>(Component: React.ComponentType<P>): React.ForwardRefExoticComponent<React.PropsWithoutRef<Omit<P, "loggingIn"> & Partial<WithLoggingInProps>> & React.RefAttributes<unknown>>;
```

### withLoggingOut(...)

Return a wrapped version of the given component, where the component receives a stateful prop of whether the logout method is currently in progress. A higher-order component. Uses [`Meteor.loggingOut`](https://docs.meteor.com/api/accounts.html#Meteor-loggingOut), a reactive data source.

- Arguments:

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| Component | `React.ComponentType` | yes | A React component. |

- Returns: `React.ForwardRefExoticComponent`.

Example:

```tsx
import React from 'react';
import { withLoggingOut } from 'meteor/mdg:react-meteor-accounts';

class Foo extends React.Component {
  render() {
    if (!this.props.loggingOut) {
      return null;
    }

    return (
      <div>Logging out, please wait a moment.</div>
    );
  }
}

const FooWithLoggingOut = withLoggingOut(Foo);
```

TypeScript signature:

```ts
function withLoggingOut<P>(Component: React.ComponentType<P>): React.ForwardRefExoticComponent<React.PropsWithoutRef<Omit<P, "loggingOut"> & Partial<WithLoggingOutProps>> & React.RefAttributes<unknown>>;
```
