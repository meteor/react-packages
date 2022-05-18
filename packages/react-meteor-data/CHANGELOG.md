# CHANGELOG
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
