import { Meteor } from 'meteor/meteor';

import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';
checkNpmVersions({
  'react': '0.14.x',
  'react-dom': '0.14.x'
});

const ReactDev = require('react');
const ReactDOMDev = require('react-dom');

let ReactDOMServerDev;
if (Meteor.isServer) {
  ReactDOMServerDev = require('react-dom/server');
}

export { ReactDev, ReactDOMDev, ReactDOMServerDev };
