Plugin.registerCompiler({
  extensions: ['jsx'],
}, function () {
  return new BabelCompiler({
    modules: true,
    react: true
  });
});
