Plugin.registerCompiler({
  extensions: ['jsx'],
}, function () {
  return new BabelCompiler({
    react: true
  });
});
