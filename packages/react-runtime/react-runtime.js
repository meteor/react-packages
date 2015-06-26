if (Package["react-runtime-dev"]) {
  React = Package["react-runtime-dev"].ReactDev;
} else {
  React = ReactProd;
}