import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

const requiredPackages = {
  react: '15.x',
  'react-dom': '15.x',
  'react-addons-transition-group': '15.x',
  'react-addons-css-transition-group': '15.x',
  'react-addons-linked-state-mixin': '15.x',
  'react-addons-create-fragment': '15.x',
  'react-addons-update': '15.x',
  'react-addons-pure-render-mixin': '15.x',
};

if (Meteor.isDevelopment) {
  _.extend(requiredPackages, {
    'react-addons-perf': '15.x',
  });
}

import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';
checkNpmVersions(requiredPackages, 'react-runtime');

const React = require('react');
const ReactDOM = require('react-dom');

React.addons = {
  TransitionGroup: require('react-addons-transition-group'),
  CSSTransitionGroup: require('react-addons-css-transition-group'),
  LinkedStateMixin: require('react-addons-linked-state-mixin'),
  createFragment: require('react-addons-create-fragment'),
  update: require('react-addons-update'),
  PureRenderMixin: require('react-addons-pure-render-mixin'),
};

if (Meteor.isDevelopment) {
  React.addons.TestUtils = require('react-dom/test-utils');
  React.addons.Perf = require('react-addons-perf');
}

let ReactDOMServer;
if (Meteor.isServer) {
  ReactDOMServer = require('react-dom/server');
}

export { React, ReactDOM, ReactDOMServer };
