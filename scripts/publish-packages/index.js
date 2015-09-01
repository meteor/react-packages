// Run main.js as ES6

require("meteor-babel/register")({
  babelOptions: require("meteor-babel").getDefaultOptions()
});

require("./main");
