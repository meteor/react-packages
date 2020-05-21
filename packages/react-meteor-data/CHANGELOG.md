# CHANGELOG

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
