var Sync = require("sync");
var fs = require("fs");
var _ = require("underscore");

var promptSync = require("./prompt-sync");
var execSync = require("./exec-sync");
const { goToRootAndCheckBranch, goToRoot } = require("./utils");

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
      JSON.parse(fs.readFileSync(".packages-to-republish.json", "utf8"));

    // XXX hardcoded order because I don't want to solve dependencies at the
    // moment
    const publishOrder = [
      "jsx",
      "react-runtime-dev",
      "react-runtime-prod",
      "react-runtime",
      "react-meteor-data",
      "react-template-helper",
      "react"
    ];

    // First, publish the packages
    publishOrder.forEach((name) => {
      if (! _.has(packageVersions, name)) {
        // Only publish the package if it is in packageVersions
        return;
      }

      process.chdir(`packages/${name}`);
      execSync("meteor publish");
      goToRoot();
    });

    // Then, commit. We need to commit after publishing so that we get the
    // changes to .versions in the same commit
    const listOfVersions = _.map(packageVersions, (version, name) => {
      return `* ${name}: ${version}`;
    }).join("\n");

    const commitMessage = `\
Bump package versions to publish.

New package versions:
${listOfVersions}`;

    // Write commit message to temp file so that we don't have to mess around
    // with escaping newlines
    const tempFilename = "temp-file-for-commit-msg.txt";
    fs.writeFileSync(tempFilename, commitMessage);
    execSync(`git commit -a -F ${tempFilename}`);
    fs.unlinkSync(tempFilename);

    // Tag the commit with every package that was published
    _.each(packageVersions, (version, name) => {
      execSync(`git tag ${name}@${version}`);
    });

    // Push the tags
    execSync("git push --tags");

    // Check out master
    execSync("git checkout master");

    // Merge
    execSync("git merge devel --no-ff -m 'Merge devel after publishing'");

    // Push, with extra options to make sure it works
    execSync("git push -u origin master");

    // Delete the flag file
    fs.unlinkSync(".packages-to-republish.json");

  } catch (err) {
    console.log(err.stack);
    process.exit(1);
  }
});
