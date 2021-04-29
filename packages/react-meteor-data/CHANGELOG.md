# CHANGELOG

* Fix data was not correct saved between renders.

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
