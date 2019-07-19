/* global Tinytest */
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { ReactiveDict } from 'meteor/reactive-dict';

import useTracker from './useTracker';

Tinytest.add('useTracker - no deps', async function (test) {
  const reactiveDict = new ReactiveDict('test1', { key: 'initial' });
  let renderCount = 0;

  const { result, rerender, unmount, waitForNextUpdate } = renderHook(
    () => useTracker(() => {
      renderCount++;
      return reactiveDict.get('key');
    })
  );

  test.equal(result.current, 'initial', 'Expect initial value to be "initial"');
  test.equal(renderCount, 1, 'Should run rendered 1 times');

  if (Meteor.isServer) return;

  act(() => reactiveDict.set('key', 'changed'));
  await waitForNextUpdate();

  test.equal(result.current, 'changed', 'Expect new value to be "changed"');
  test.equal(renderCount, 2, 'Should run rendered 2 times');

  rerender();

  test.equal(result.current, 'changed', 'Expect value of "changed" to persist after rerender');
  test.equal(renderCount, 3, 'Should run rendered 3 times');

  unmount();
  reactiveDict.destroy();
  test.equal(renderCount, 3, 'Should run rendered 3 times');
});

Tinytest.add('useTracker - with deps', async function (test) {
  const reactiveDict = new ReactiveDict('test2', {});
  let renderCount = 0;

  const { result, rerender, unmount, waitForNextUpdate } = renderHook(
    ({ name }) => useTracker(() => {
      renderCount++;
      reactiveDict.setDefault(name, 'default');
      return reactiveDict.get(name);
    }, [name]),
    { initialProps: { name: 'name' } }
  );

  test.equal(result.current, 'default', 'Expect the default value for given name to be "default"');
  test.equal(renderCount, 1, 'Should run rendered 1 times');

  if (Meteor.isServer) return;

  act(() => reactiveDict.set('name', 'changed'));
  await waitForNextUpdate();

  test.equal(result.current, 'changed', 'Expect the new value for given name to be "changed"');
  test.equal(renderCount, 2, 'Should run rendered 2 times');

  rerender();

  test.equal(result.current, 'changed', 'Expect the new value "changed" for given name to have persisted through render');
  test.equal(renderCount, 3, 'Should run rendered 3 times');

  rerender({ name: 'different' });

  test.equal(result.current, 'default', 'After deps change, the default value should have returned');
  test.equal(renderCount, 4, 'Should run rendered 4 times');

  unmount();
  reactiveDict.destroy();
  test.equal(renderCount, 4, 'Should run rendered 4 times');
});
