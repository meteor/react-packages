import { renderHook } from '@testing-library/react-hooks/dom';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Tinytest } from 'meteor/tinytest';
import { useLoggingIn, useLoggingOut, useUser, useUserId } from './react-accounts';

// Prepare method for clearing DB (doesn't need to be isomorphic).
if (Meteor.isServer) {
  Meteor.methods({
    reset() {
      const res = Meteor.users.remove({});
      console.log(`method - reset - ${res}`)
      return res
    },
  });
}

if (Meteor.isClient) {
  // fixture data
  const username = 'username';
  const password = 'password'; 
  
  // common test actions
  async function login() {
    await new Promise<void>((resolve, reject) => {
      Meteor.loginWithPassword(username, password, (error) => {
        if (error) reject(error);
        else resolve();
      })
    })
  }
  async function logout() {
    await new Promise<void>((resolve, reject) => {
      Meteor.logout((error) => {
        if (error) reject(error);
        else resolve();
      })
    })
  }
  
  // common test arrangements
  async function beforeEach() {
    // reset DB; must complete before creation to avoid potential overlap
    await new Promise((resolve, reject) => {
      Meteor.call('reset', (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
    });
    // prepare sample user
    await new Promise<void>((resolve, reject) => {
      Accounts.createUser({ username, password }, (error) => {
        if (error) reject(error);
        else resolve();
      })
    });
    // logout since `createUser` auto-logs-in
    await logout();
  }

  // NOTE: each test body has three blocks: Arrange, Act, Assert.

  Tinytest.addAsync('useUserId - has initial value of `null`', async function (test, onComplete) {
    await beforeEach();

    const { result } = renderHook(() => useUserId());

    test.isNull(result.current);
    onComplete();
  });

  Tinytest.addAsync('useUserId - is reactive to login', async function (test, onComplete) {
    await beforeEach();

    const { result, waitForNextUpdate } = renderHook(() => useUserId());
    // use `waitFor*` instead of `await`; mimics consumer usage
    login();
    await waitForNextUpdate();

    test.isNotNull(result.current)
    onComplete();
  });

  Tinytest.addAsync('useUserId - is reactive to logout', async function (test, onComplete) {
    await beforeEach();
    await login();

    const { result, waitForNextUpdate } = renderHook(() => useUserId());
    // use `waitFor*` instead of `await`; mimics consumer usage
    logout();
    await waitForNextUpdate();

    test.isNull(result.current)
    onComplete();
  });
  
  Tinytest.addAsync('useLoggingIn - has initial value of `false`', async function (test, onComplete) {
    await beforeEach();

    const { result } = renderHook(() => useLoggingIn());

    test.isFalse(result.current);
    onComplete();
  });
  
  Tinytest.addAsync('useLoggingIn - is reactive to login starting', async function (test, onComplete) {
    await beforeEach();

    const { result, waitForNextUpdate } = renderHook(() => useLoggingIn());
    login();
    // first update will be while login strategy is in progress
    await waitForNextUpdate();

    test.isTrue(result.current);
    onComplete();
  });
  
  Tinytest.addAsync('useLoggingIn - is reactive to login finishing', async function (test, onComplete) {
    await beforeEach();

    const { result, waitForNextUpdate } = renderHook(() => useLoggingIn());
    login();
    await waitForNextUpdate();
    // second update will be after login strategy finishes
    await waitForNextUpdate();

    test.isFalse(result.current);
    onComplete();
  });
}
