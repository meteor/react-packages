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

For recent changes, check the [changelog](./CHANGELOG.md)

## Usage

Utilities for each data source are available in two React paradigms: hooks for use in functional components and higher-order components (HOCs) for use with class components.

_Note:_ All HOCs forward refs.

### useUser() / withUser(...)

The hook, `useUser()`, returns a stateful value of the current user record.

The HOC, `withUser(Component)`, returns a wrapped version of `Component` that receives a prop of the current user record, `user`.

For more details about the data source, consult the documentation of [`Meteor.user(...)](https://docs.meteor.com/api/accounts.html#Meteor-user).

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
function Bar(props) {
  if (props.user === null) {
    return <h1>Log in</h1>;
  }

  return <h1>Hello {props.user.username}</h1>;
}

withUser(Bar);
```

TypeScript signatures:

```ts
// Hook
const useUser: () => Meteor.User;

// HOC
const withUser: (Component: any) => React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
```

### useUserId() / withUserId(...)

The hook, `useUserId()`, returns a stateful value of the current user id.

The HOC, `withUserId(Component)`, returns a wrapped version of `Component` that receives a prop of the current user id, `userId`.

For more details about the data source, consult the documentation of [`Meteor.userId()](https://docs.meteor.com/api/accounts.html#Meteor-userId).

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
function Bar(props) {
  return (
    <div>
      <h1>Account Details</h1>
      {props.userId ? (
          <p>Your unique account id is {props.userId}.</p>
        ) : (
          <p>Log-in to view your account details.</p>
        )}
    </div>
  )
}

withUserId(Bar);
```

TypeScript signatures:

```ts
// Hook
const useUserId: () => string;

// HOC
const withUserId: (Component: any) => React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
```
