const Sync = require("sync");
const fs = require("fs");
const _ = require("underscore");

const promptSync = require("./prompt-sync");
const execSync = require("./exec-sync");
const { goToRootAndCheckBranch } = require("./utils");

// Run in a fiber, so that we can use synchronous APIs
Sync(function () {
  try {
    goToRootAndCheckBranch();

    if (fs.existsSync(".packages-to-republish.json")) {
      console.log(
`.packages-to-republish.json file found. Did you mean to run this script with
the --finish option?
`);
      process.exit(1);
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
    const changedPackages = _.chain(changedPackageFiles)
      .map(file => file.split("/")[1])
      .without("babel-tests")
      .uniq()
      .compact()
      .value();

    // Find out which packages depend (directly or indirectly) on the changed
    // packages; we need to republish them too, in order for people to get the
    // newest versions of everything when adding the package.
    //
    // To find indirect dependencies as well as direct ones we look at .version
    // files, which contain version information about all dependencies at the
    // time the package was last published.
    const packagesThatDependOnChanged = _.union.apply(null, changedPackages.map(pkg => {
      // lines look like: packages/react/.versions:react-runtime@0.14.0
      const grepOutput = execSync(
        `git grep "${pkg}@" packages | grep .versions`).stdout;

      return _.compact(grepOutput.split("\n")).map(line => line.split("/")[1]);
    }));

    const packagesToRepublish = _.union(packagesThatDependOnChanged,
      changedPackages);

    console.log("Packages that need to be republished:");
    packagesToRepublish.forEach(pkg => { console.log(`* ${pkg}`); });
    console.log();

    // Remember which versions we are changing to
    const packageVersions = {};

    // Now, we want to ask people what versions they want to bump to
    packagesToRepublish.forEach((pkg) => {
      const packageJsFile = `packages/${pkg}/package.js`;
      const versionRegexp = /version:(\s*['"])(.*)(['"])/;
      const packageJsContents = fs.readFileSync(packageJsFile, "utf8");
      const pkgVersion = packageJsContents.match(versionRegexp)[2];

      let defaultNewVersion;
      if (pkgVersion.indexOf("-") === -1) {
        // No pre-release version
        if (pkgVersion.indexOf("_") === -1) {
          // No wrapper version, bump minor
          const split = pkgVersion.split(".");
          split[2] = (parseInt(split[2], 10) + 1) + "";
          defaultNewVersion = split.join(".");
        } else {
          // There's a wrapper version, bump wrapper number
          const split = pkgVersion.split("_");
          split[1] = (parseInt(split[1], 10) + 1) + "";
          defaultNewVersion = split.join("_");
        }
      }

      const defaultVersionDisplay = defaultNewVersion ?
        `[${defaultNewVersion}]` : "";

      const newPkgVersion = promptSync(
`Package '${pkg}' was at version '${pkgVersion}'. \
What should the new version be? ${defaultVersionDisplay}`) || defaultNewVersion;

      if (! newPkgVersion) {
        throw new Error(`Didn't select a new version.`);
      }

      console.log(`You selected '${newPkgVersion}'.`);
      console.log();

      // Replace version declaration at the top of package.js
      fs.writeFileSync(packageJsFile, packageJsContents.replace(
        versionRegexp, `version:$1${newPkgVersion}$3`));

      // Remember this so that we can tag the commit later
      packageVersions[pkg] = newPkgVersion;

      // Replace references to this package in other packages, so that they
      // depend on the new version of this package. Make sure to keep the
      // distinction between "foo@1.2.3" and "foo@=1.2.3".
      //
      // Note: We don't yet have the logic to deal with the || operator in this
      // script yet.
      fs.readdirSync("packages/").forEach(otherPkg => {
        const otherPackageJsFile = `packages/${otherPkg}/package.js`;
        const otherPackageJsContents =
                fs.readFileSync(otherPackageJsFile, "utf8");
        fs.writeFileSync(otherPackageJsFile, otherPackageJsContents.replace(
          new RegExp(`(['"]${pkg}@=?).*(['"])`, "g"),
          `$1${newPkgVersion}$2`));

      });
    });

    // Now we are going to defer back to the user. It's up to them to run the
    // second script in the chain to actually publish the packages after
    // inspecting the diff.
    fs.writeFileSync(".packages-to-republish.json",
      JSON.stringify(packageVersions));

    console.log(
`The script has written a record of the packages that need to be republished to
.packages-to-republish.json in the root of the repo, and updated the package.js
files to reflect the new versions you selected. Now you should:

1. Check 'git diff' to make sure you like the changes
2. Run 'publish-packages.sh --finish' again to actually publish, merge to
   master, and push a tag
` );
  } catch (err) {
    console.log(err.stack);
    process.exit(1);
  }
});
