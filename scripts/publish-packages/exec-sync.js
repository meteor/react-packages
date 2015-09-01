var child_process = require("child_process");

// Calls a command synchronously, returning an object with {stdout:
// ..., stderr: ...} or throwing an error on failure. `options` match
// the ones on `child_process.exec`.
//
// Note: If we were using Node 0.12 we could just use
// `child_process.execSync`, but some people at MDG like to only use
// the version of Node that comes with Meteor, which is 0.10.x
function execSync(command, options) {
  // A form of `child_process.exec` where the callback takes (err,
  // res); res is {stdout: ..., stderr: ...}.  Note: `options` isn't
  // optional here
  function execWithStdCallback(command, options, callback) {
    child_process.exec(command, options, function (err, stdout, stderr) {
      callback(err, {stdout: stdout, stderr: stderr});
    });
  }

  return execWithStdCallback.sync(null, command, options || {});
}

module.exports = execSync;
