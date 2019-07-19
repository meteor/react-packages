/* global Tinytest */
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { ReactiveDict } from 'meteor/reactive-dict';

import useTracker from './useTracker';

Tinytest.add('useTracker - no deps', async function (test) {
  const reactiveDict = new ReactiveDict();
  let runCount = 0;

  const { result, rerender, unmount, waitForNextUpdate } = renderHook(
    ({ name }) => useTracker(() => {
      runCount++;
      reactiveDict.setDefault(name, 'initial');
      return reactiveDict.get(name);
    }),
    { initialProps: { name: 'key' } }
  );

  test.equal(result.current, 'initial', 'Expect initial value to be "initial"');
  test.equal(runCount, 1, 'Should have run 1 times');

  act(() => reactiveDict.set('key', 'changed'));
  await waitForNextUpdate();

  test.equal(result.current, 'changed', 'Expect new value to be "changed"');
  test.equal(runCount, 2, 'Should have run 2 times');

  rerender();
  await waitForNextUpdate();

  test.equal(result.current, 'changed', 'Expect value of "changed" to persist after rerender');
  test.equal(runCount, 3, 'Should have run 3 times');

  rerender({ name: 'different' });
  await waitForNextUpdate();

  test.equal(result.current, 'default', 'After deps change, the default value should have returned');
  test.equal(runCount, 4, 'Should have run 4 times');

  unmount();
  test.equal(runCount, 4, 'Unmount should not cause a tracker run');

  act(() => reactiveDict.set('different', 'changed again'));
  // we can't use await waitForNextUpdate() here because it doesn't trigger re-render - is there a way to test that?

  test.equal(result.current, 'default', 'After unmount, changes to the reactive source should not update the value.');
  test.equal(runCount, 4, 'After unmount, useTracker should no longer be tracking');

  reactiveDict.destroy();
});

Tinytest.add('useTracker - with deps', async function (test) {
  const reactiveDict = new ReactiveDict();
  let runCount = 0;

  const { result, rerender, unmount, waitForNextUpdate } = renderHook(
    ({ name }) => useTracker(() => {
      runCount++;
      reactiveDict.setDefault(name, 'default');
      return reactiveDict.get(name);
    }, [name]),
    { initialProps: { name: 'name' } }
  );

  test.equal(result.current, 'default', 'Expect the default value for given name to be "default"');
  test.equal(runCount, 1, 'Should have run 1 times');

  act(() => reactiveDict.set('name', 'changed'));
  await waitForNextUpdate();

  test.equal(result.current, 'changed', 'Expect the new value for given name to be "changed"');
  test.equal(runCount, 2, 'Should have run 2 times');

  rerender();
  await waitForNextUpdate();

  test.equal(result.current, 'changed', 'Expect the new value "changed" for given name to have persisted through render');
  test.equal(runCount, 3, 'Should have run 3 times');

  rerender({ name: 'different' });
  await waitForNextUpdate();

  test.equal(result.current, 'default', 'After deps change, the default value should have returned');
  test.equal(runCount, 4, 'Should have run 4 times');

  unmount();
  test.equal(runCount, 4, 'Unmount should not cause a tracker run');
  // we can't use await waitForNextUpdate() here because it doesn't trigger re-render - is there a way to test that?

  act(() => reactiveDict.set('different', 'changed again'));

  test.equal(result.current, 'default', 'After unmount, changes to the reactive source should not update the value.');
  test.equal(runCount, 4, 'After unmount, useTracker should no longer be tracking');

  reactiveDict.destroy();
});
