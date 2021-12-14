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
    console.log('before login');
    await new Promise<void>((resolve, reject) => {
        Meteor.loginWithPassword(username, password, (error) => {
          if (error) reject(error);
          else resolve();
        })
      })
    console.log('after login');
  }
  async function logout() {
    console.log('before logout');
    await new Promise<void>((resolve, reject) => {
      Meteor.logout((error) => {
        if (error) reject(error);
        else resolve();
      })
    })
    console.log('after logout');
  }
  
  // common test arrangements
  async function beforeEach() {
    console.log('before beforeEach');
    console.log('beforeEach - before call reset');
    // reset DB; must complete before creation to avoid potential overlap
    await new Promise((resolve, reject) => {
      Meteor.call('reset', (error, result) => {
        console.log(`call - reset - ${result} - ${error}`)
        if (error) reject(error);
        else resolve(result);
      })
    });
    console.log('beforeEach - after call reset');
    // prepare sample user
    console.log('beforeEach - before createUser');
    await new Promise<void>((resolve, reject) => {
      Accounts.createUser({ username, password }, (error) => {
        if (error) reject(error);
        else resolve();
      })
    });
    console.log('beforeEach -before createUser');
    // logout since `createUser` auto-logs-in
    await logout();
    console.log('after beforeEach');
  }
  async function afterEach() {
    console.log('before afterEach');
    await logout();
    console.log('after afterEach');
  }


  // NOTE: each test body has three blocks: Arrange, Act, Assert.

  Tinytest.addAsync('useUserId - has initial value of `null`', async function (test, onComplete) {
    console.log('test - before - beforeEach');
    try {
      await beforeEach();
    } catch (error) {
      console.log('test - catch - beforeEach')
      console.error(error)
      throw error;
    }
    console.log('test - after - beforeEach');

    const { result } = renderHook(() => useUserId());

    test.isNull(result.current, 'Expect initial value to be `null`');
    onComplete();
  });

  Tinytest.addAsync('useUserId - is reactive to login', async function (test, onComplete) {
    await beforeEach();

    const { result, waitForNextUpdate } = renderHook(() => useUserId());
    // use `waitFor*` instead of `await`; mimics consumer usage
    login();
    await waitForNextUpdate();

    test.isNotNull(result.current, 'Expect value after login to be not `null`')
    onComplete();
  });

  
  Tinytest.addAsync('useUserId - is reactive to logout', async function (test, onComplete) {
    await beforeEach();
    await login();

    const { result, waitForNextUpdate } = renderHook(() => useUserId());
    // use `waitFor*` instead of `await`; mimics consumer usage
    logout();
    await waitForNextUpdate();

    test.isNull(result.current, 'Expect value after logout to be `null`')
    onComplete();
  });
}
