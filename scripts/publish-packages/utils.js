const fs = require("fs");
const _ = require("underscore");

const execSync = require("./exec-sync");

module.exports.goToRootAndCheckBranch = function goToRootAndCheckBranch() {
  // Go to root of repository
  const repoRootDir = execSync("git rev-parse --show-toplevel").stdout.trim();
  process.chdir(repoRootDir);

  // Check if we are on devel, because if we are on master we should have
  // already published, and if we are not on devel we are about to
  // accidentally publish some branch.
  if (execSync("git status").stdout.indexOf("On branch devel") === -1) {
    throw new Error("Need to be on 'devel' branch to publish packages.");
  }
}
