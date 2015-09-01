var Sync = require("sync");
var fs = require("fs");
var _ = require("underscore");

var promptSync = require("./prompt_sync");
var execSync = require("./exec_sync");

// Run in a fiber, so that we can use synchronous APIs
Sync(function () {
  try {
    // Go to root of repository
    const repoRootDir = execSync("git rev-parse --show-toplevel").stdout.trim();
    process.chdir(repoRootDir);

    // Check if we are on devel, because if we are on master we should
    // have already published, and if we are not on devel we are about
    // to accidentally publish some branch.
    if (execSync("git status").stdout.indexOf("On branch devel") === -1) {
      throw new Error("Need to be on 'devel' branch to publish packages.");
    }

    // Check if there are any uncommitted changes, because we are going to be
    // changing stuff and merging branches for you.
    const uncommittedFiles = _.compact(_.union(
      execSync("git diff --name-only").stdout.trim().split('\n'),
      execSync("git diff --name-only --staged").stdout.trim().split('\n')));

    if (uncommittedFiles.length !== 0) {
      throw new Error(
`You have uncommitted changes in your repository. \
Please commit or stash before publishing.`);
    }

    // See which files have changed from master; these are the
    // packages that have changes to the source code.
    const changedPackageFiles = execSync(
      "git diff --name-only master | grep \"^packages/\"").stdout
          .trim().split("\n");

    // Convert the list of changed files into a list of changed
    // package names, each corresponding to a directory
    const changedPackages = _.chain(changedPackageFiles).map(
      file => file.split("/")[1]).uniq().compact().value();

    // Find out which packages depend (directly or indirectly) on the
    // changed packages; we need to republish them too, in order for
    // people to get the newest versions of everything when adding the
    // package.
    //
    // To find indirect dependencies as well as direct ones we look at
    // .version files, which contain version information about all
    // dependencies at the time the package was published.
    const packagesThatDependOnChanged = _.union.apply(null, changedPackages.map(pkg => {
        // lines looks like: packages/react/.versions:react-runtime@0.13.3_5
        const grepOutput = execSync(
          `git grep "${pkg}@" packages | grep .versions`).stdout;

        return _.compact(grepOutput.split("\n")).map(line => line.split("/")[1]);
      }));

    const packagesToRepublish = _.union(packagesThatDependOnChanged, changedPackages);

    console.log("Packages that need to be republished:");
    packagesToRepublish.forEach(pkg => { console.log(`* ${pkg}`); });
    console.log();

    // Now, we want to ask people what versions they want to bump to
    packagesToRepublish.forEach((pkg) => {
      const packageJsFile = `packages/${pkg}/package.js`;
      const versionRegexp = /version:(\s*['"])(.*)(['"])/;
      const packageJsContents = fs.readFileSync(packageJsFile, {encoding: "utf8"});
      const pkgVersion = packageJsContents.match(versionRegexp)[2];

      const newPkgVersion = promptSync(
`Package '${pkg}' was at version '${pkgVersion}'. \
What should the new version be? `);
      console.log(`You selected '${newPkgVersion}'.`);
      console.log();

      // Replace version declaration at the top of package.js
      fs.writeFileSync(packageJsFile, packageJsContents.replace(
        versionRegexp, `version:$1${newPkgVersion}$3`));

      // Replace references to this package in other packages, so that
      // they depend on the new version of this package. Make sure to
      // keep the distinction between "foo@1.2.3" and "foo@=1.2.3".
      //
      // Note: We don't yet have the logic to deal with the ||
      // operator in this script yet.
      fs.readdirSync("packages/").forEach(otherPkg => {
        const otherPackageJsFile = `packages/${otherPkg}/package.js`;
        const otherPackageJsContents =
                fs.readFileSync(otherPackageJsFile, {encoding: "utf8"});
        fs.writeFileSync(otherPackageJsFile, otherPackageJsContents.replace(
          new RegExp(`(['"]${pkg}@=?).*(['"])`, "g"),
          `$1${newPkgVersion}$2`));

      });
    });

  } catch (err) {
    console.log(err.stack);
    process.exit(1);
  }
});
