/* global Tinytest */
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { ReactiveDict } from 'meteor/reactive-dict';

import useTracker from './useTracker';

Tinytest.add('useTracker - no deps', async function (test) {
  const reactiveDict = new ReactiveDict();
  let runCount = 0;
  let computation;
  let createdCount = 0;
  let destroyedCount = 0;

  const { result, rerender, unmount, waitForNextUpdate } = renderHook(
    ({ name }) => useTracker(() => {
      runCount++;
      reactiveDict.setDefault(name, 'initial');
      return reactiveDict.get(name);
    }, null, (c) => {
      computation = c;
      createdCount++;
      return () => {
        destroyedCount++;
      }
    }),
    { initialProps: { name: 'key' } }
  );

  test.equal(result.current, 'initial', 'Expect initial value to be "initial"');
  test.equal(runCount, 1, 'Should have run 1 times');
  test.equal(createdCount, 1, 'Should have been created 1 times');
  test.equal(destroyedCount, 0, 'Should not have been destroyed yet');

  act(() => reactiveDict.set('key', 'changed'));
  await waitForNextUpdate();

  test.equal(result.current, 'changed', 'Expect new value to be "changed"');
  test.equal(runCount, 2, 'Should have run 2 times');
  test.equal(createdCount, 2, 'Should have been created 2 times');
  test.equal(destroyedCount, 1, 'Should have been destroyed 1 less than created');

  rerender();
  await waitForNextUpdate();

  test.equal(result.current, 'changed', 'Expect value of "changed" to persist after rerender');
  test.equal(runCount, 3, 'Should have run 3 times');
  test.equal(createdCount, 3, 'Should have been created 3 times');
  test.equal(destroyedCount, 2, 'Should have been destroyed 1 less than created');

  rerender({ name: 'different' });
  await waitForNextUpdate();

  test.equal(result.current, 'default', 'After deps change, the default value should have returned');
  test.equal(runCount, 4, 'Should have run 4 times');
  test.equal(createdCount, 4, 'Should have been created 4 times');
  test.equal(destroyedCount, 3, 'Should have been destroyed 1 less than created');

  unmount();
  test.equal(runCount, 4, 'Unmount should not cause a tracker run');
  test.equal(createdCount, 4, 'Should have been created 4 times');
  test.equal(destroyedCount, 4, 'Should have been destroyed the same number of times as created');

  act(() => reactiveDict.set('different', 'changed again'));
  // we can't use await waitForNextUpdate() here because it doesn't trigger re-render - is there a way to test that?

  test.equal(result.current, 'default', 'After unmount, changes to the reactive source should not update the value.');
  test.equal(runCount, 4, 'After unmount, useTracker should no longer be tracking');
  test.equal(createdCount, 4, 'Should have been created 4 times');
  test.equal(destroyedCount, 4, 'Should have been destroyed the same number of times as created');

  reactiveDict.destroy();
});

Tinytest.add('useTracker - with deps', async function (test) {
  const reactiveDict = new ReactiveDict();
  let runCount = 0;
  let computation;
  let createdCount = 0;
  let destroyedCount = 0;

  const { result, rerender, unmount, waitForNextUpdate } = renderHook(
    ({ name }) => useTracker(() => {
      runCount++;
      reactiveDict.setDefault(name, 'default');
      return reactiveDict.get(name);
    }, [name], (c) => {
      test.isFalse(c === computation, 'The new computation should always be a new instance');
      computation = c;
      createdCount++;
      return () => {
        destroyedCount++;
      }
    }),
    { initialProps: { name: 'name' } }
  );

  test.equal(result.current, 'default', 'Expect the default value for given name to be "default"');
  test.equal(runCount, 1, 'Should have run 1 times');
  test.equal(createdCount, 1, 'Should have been created 1 times');
  test.equal(destroyedCount, 0, 'Should not have been destroyed yet');

  act(() => reactiveDict.set('name', 'changed'));
  await waitForNextUpdate();

  test.equal(result.current, 'changed', 'Expect the new value for given name to be "changed"');
  test.equal(runCount, 2, 'Should have run 2 times');
  test.equal(createdCount, 1, 'Should have been created 1 times');
  test.equal(destroyedCount, 0, 'Should not have been destroyed yet');

  rerender();
  await waitForNextUpdate();

  test.equal(result.current, 'changed', 'Expect the new value "changed" for given name to have persisted through render');
  test.equal(runCount, 3, 'Should have run 3 times');
  test.equal(createdCount, 1, 'Should have been created 1 times');
  test.equal(destroyedCount, 0, 'Should not have been destroyed yet');

  rerender({ name: 'different' });
  await waitForNextUpdate();

  test.equal(result.current, 'default', 'After deps change, the default value should have returned');
  test.equal(runCount, 4, 'Should have run 4 times');
  test.equal(createdCount, 2, 'Should have been created 2 times');
  test.equal(destroyedCount, 1, 'Should have been destroyed 1 times');

  unmount();
  // we can't use await waitForNextUpdate() here because it doesn't trigger re-render - is there a way to test that?
  test.equal(runCount, 4, 'Unmount should not cause a tracker run');
  test.equal(createdCount, 2, 'Should have been created 2 times');
  test.equal(destroyedCount, 2, 'Should have been destroyed 2 times');

  act(() => reactiveDict.set('different', 'changed again'));

  test.equal(result.current, 'default', 'After unmount, changes to the reactive source should not update the value.');
  test.equal(runCount, 4, 'After unmount, useTracker should no longer be tracking');
  test.equal(createdCount, 2, 'Should have been created 2 times');
  test.equal(destroyedCount, 2, 'Should have been destroyed 2 times');

  reactiveDict.destroy();
});
