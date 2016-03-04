import { Meteor } from 'meteor/meteor';

import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';
checkNpmVersions({
  'react': '0.14.x',
  'react-dom': '0.14.x'
});

const React = require('react');
const ReactDOM = require('react-dom');

let ReactDOMServer;
if (Meteor.isServer) {
  ReactDOMServer = require('react-dom/server');
}

export { React, ReactDOM, ReactDOMServer };
