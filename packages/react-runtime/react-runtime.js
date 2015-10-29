if (Package["react-runtime-dev"]) {
  React = Package["react-runtime-dev"].ReactDev;
  ReactDOM = Package["react-runtime-dev"].ReactDOMDev;

  if (Meteor.isServer) {
    ReactDOMServer = Package["react-runtime-dev"].ReactDOMServer;
  }
} else if (Package["react-runtime-prod"]) {
  React = Package["react-runtime-prod"].ReactProd;
  ReactDOM = Package["react-runtime-prod"].ReactDOMProd;

  if (Meteor.isServer) {
    ReactDOMServer = Package["react-runtime-prod"].ReactDOMServer;
  }
} else {
  // not sure how this can happen
  throw new Error("Couldn't find react-runtime-dev or react-runtime-prod packages");
}
