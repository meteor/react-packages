var Sync = require("sync");
var fs = require("fs");
var _ = require("underscore");

var promptSync = require("./prompt-sync");
var execSync = require("./exec-sync");

// Run in a fiber, so that we can use synchronous APIs
Sync(function () {
  try {
    goToRootAndCheckBranch();

    if (! fs.existsSync(".packages-to-republish.json")) {
      console.log(
`.packages-to-republish.json file not found. Did you mean to run this script
without the --finish option?
`);
      process.exit(1);
    }

    const packageVersions =
      fs.readFileSync(".packages-to-republish.json", "utf8");



  } catch (err) {
    console.log(err.stack);
    process.exit(1);
  }
});
