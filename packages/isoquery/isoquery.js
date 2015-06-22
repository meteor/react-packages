// A simple pattern that lets us share code between publish functions
// on the server and calls to `withIsoquery` on the client
Isoquery = {
  load: function (name /*, ...args*/) {
    var args = arguments;
    var isoqueryArgs = _.toArray(arguments).slice(1);

    if (!Isoquery._all[name])
      throw new Error("No such isoquery: " + name);

    return {
      subscription: function () {
        return Meteor.subscribe.apply(null, args);
      },
      data: function () {
        return Isoquery._all[name].apply(null, isoqueryArgs).fetch();
      }
    };
  },

  define: function(name, fn) {
    if (Isoquery._all[name])
      throw new Error("Isoquery already defined: " + name);
    Isoquery._all[name] = fn;
  },

  // maps names to isoquery functions
  _all: {}
};

