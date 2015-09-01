var readline = require("readline");

var promptSync = function (query) {
  const rl = readline.createInterface(process.stdin, process.stdout, null);
  // A form of `rl.question` where the callback takes (err, res); (err
  // is always null)
  function prompt(query, callback) {
    rl.question(query, function (answer) {
      callback(null, answer);
    });
  }

  const answer = prompt.sync(rl, query);
  rl.close();
  return answer;
};

module.exports = promptSync;
