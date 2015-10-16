React.require = require;
ReactProd = React;
ReactDOMProd = ReactDOM;

if (Meteor.isServer) {
  ReactDOMServerProd = ReactDOMServer;
}
