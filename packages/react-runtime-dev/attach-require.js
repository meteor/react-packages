React.require = require;
ReactDev = React;
ReactDOMDev = ReactDOM;

if (Meteor.isServer) {
  ReactDOMServerDev = ReactDOMServer;
}
