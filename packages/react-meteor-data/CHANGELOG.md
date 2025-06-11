# CHANGELOG

## v4.0.0-beta.0, xxx
*  Breaking change: useFind describes no deps by default [#431](https://github.com/meteor/react-packages/pull/431)
*  Fix concurrency issue with useFind [PR#419](https://github.com/meteor/react-packages/pull/419)
*  Improve `useFind` and `useSubscribe` React suspense hooks [PR#420](https://github.com/meteor/react-packages/pull/429), [#430](https://github.com/meteor/react-packages/pull/430) and [#441](https://github.com/meteor/react-packages/pull/441)

## v3.0.3, 2024-12-30
*  Add `useSubscribeSuspenseServer` hook to be used in SSR.

## v3.0.1, 2024-07-18
*  Replace Meteor dependency version from 3.0-rc.0 to 3.0

## v3.0.0, 2024-07-12
*  Official bumped package version to be compatible with meteor v3

## v3.0.0-alpha.6, 2023-05-11
*  Bumped package version to be compatible with meteor v3

## v2.7.2, 2023-04-20
*  Updated the `suspense/useFind` hook to be isomorphic.
*  Updated the `suspense/useFind` types to match its implementation. [PR](https://github.com/meteor/react-packages/pull/390).

## v2.7.1, 2023-03-16
*  Added missing dependencies for the suspense hooks.

## v2.7.0, 2023-03-16
*  Added suspendable hooks:
  - `suspense/useFind`: A Suspense version of `useFind`. Is intended to be used along with SSR.
  - `suspense/useSubscribe`: A Suspense version of `useSubscribe`, moving the isLoading checking state to Suspense
  - `suspense/useTracker`: A Suspense version of `useTracker`, that accepts async function and maintains the reactivity of the data.
more can be seen in the docs.


## v2.6.3, 2023-02-10
*  Removed assets so that zodern:types can work properly. More on how to use core types can be seen [here](https://docs.meteor.com/using-core-types.html). [PR](https://github.com/meteor/react-packages/pull/377).

## v2.6.2, 2023-02-02

* Stop the computation immediately to avoid creating side effects in render. refers to this issues:
  [#382](https://github.com/meteor/react-packages/issues/382)
  [#381](https://github.com/meteor/react-packages/issues/381)

## v2.6.1, 2023-01-04
*  Added types to the package via zodern:types. More on how to use core types can be seen [here](https://docs.meteor.com/using-core-types.html). [PR](https://github.com/meteor/react-packages/pull/377).


## v2.6.0, 2022-11-28
*  fix useFind can accept () => null as argument. Previously it returned null in this scenario, so  changed the return statement because it was returning an empty array. [PR](https://github.com/meteor/react-packages/pull/374).
* fix: named exports for useTracker and withTracker. Now it is has is standardized. [PR](https://github.com/meteor/react-packages/pull/376).


## v2.5.3, 2022-11-08
* useFind Data returned by useFind wasn't updated if the cursor was changed. It happened because the initial fetch was called only once. [PR](https://github.com/meteor/react-packages/pull/370).

## v2.5.2, 2022-10-27
* useFind  now works with async code by removes the fetch function call and adds a data initializer made with cursor observing.[PR](https://github.com/meteor/react-packages/pull/366)

## v2.5.1, 2022-05-18
* Fix useFind in SSR: check for server Cursor. [PR](https://github.com/meteor/react-packages/pull/350).

## v2.5.0, 2022-05-02
* Fix useTrackerNoDeps for React 18. [PR](https://github.com/meteor/react-packages/pull/359).

## v2.4.0, 2021-12-02
* Added `useSubscribe` and `useFind` hooks

## v2.3.3, 2021-07-14
* Fixes a publication issue in v2.3.2

## v2.3.2, 2021-07-12
* Updated dev dependencies
* Add version constraint to take package versions from Meteor 2.3+

## v2.3.1, 2021-05-10
* Adds a skipUpdate comparator option to both useTracker (with and without deps) and withTracker.
* Fixes a bug which would sometimes cause the value to get lost (specifically, when a re-render is invoked by an immediate, in-render state change).

## v2.2.2, 2021-01-28
* Fix lost reactivity when using deps. https://github.com/meteor/react-packages/pull/314

## v2.2.1, 2021-01-20
* Fix warning that was produced when useTracker was used without any deps. https://github.com/meteor/react-packages/pull/312

## v2.2.0, 2021-01-20
* Fix issue with useTracker and Subscriptions when using deps https://github.com/meteor/react-packages/pull/306
* Remove version constraint on core TypeScript package https://github.com/meteor/react-packages/pull/308

## v2.1.1, 2020-05-21
* Make pure default to true like it used to https://github.com/meteor/react-packages/issues/287

## v2.1.0, 2020-04-22
* Update and fix tests.
* Convert to TypeScript.
* Separate deps and no-deps implementation for easier to read implementation.
* Fix a problem in StrictMode when using no-deps (and withTracker) where
  updates get lost after first render.
  https://github.com/meteor/react-packages/issues/278

## v2.0.1, 2019-12-13

* Makes main module lazy. Fixes [Issue #264](https://github.com/meteor/react-packages/issues/264). Thanks [@moberegger](https://github.com/moberegger)

## v2.0.0, 2019-11-19

* Adds React Hooks support (`useTracker`)

## v1.0.0, 2019-12-13

* Renames deprecated lifecycle to support React 16.9
* Publishes branch v1.
  - This branch is not synced with devel as it requires at least version 16.8 of react.
