if (Package["react-runtime-dev"]) {
  React = Package["react-runtime-dev"].ReactDev;
} else if (Package["react-runtime-prod"]) {
  React = Package["react-runtime-prod"].ReactProd;
} else {
  // not sure how this can happen
  throw new Error("Couldn't find react-runtime-dev or react-runtime-prod packages");
}
