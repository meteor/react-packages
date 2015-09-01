// Run main.js as ES6

require("meteor-babel/register")({
  babelOptions: require("meteor-babel").getDefaultOptions()
});

if (process.argv[2] === "--finish") {
  require("./phase-two");
} else {
  require("./phase-one");
}
