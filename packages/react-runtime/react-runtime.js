import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

const requiredPackages = {
  react: '0.14.x',
  'react-dom': '0.14.x',
  'react-addons-transition-group': '0.14.x',
  'react-addons-css-transition-group': '0.14.x',
  'react-addons-linked-state-mixin': '0.14.x',
  'react-addons-create-fragment': '0.14.x',
  'react-addons-update': '0.14.x',
  'react-addons-pure-render-mixin': '0.14.x',
};

if (Meteor.isDevelopment) {
  _.extend(requiredPackages, {
    'react-addons-test-utils': '0.14.x',
    'react-addons-perf': '0.14.x',
  });
}

import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';
checkNpmVersions(requiredPackages);

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
  React.addons.TestUtils = require('react-addons-test-utils');
  React.addons.Perf = require('react-addons-perf');
}

let ReactDOMServer;
if (Meteor.isServer) {
  ReactDOMServer = require('react-dom/server');
}

export { React, ReactDOM, ReactDOMServer };
