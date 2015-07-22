var displayColumns = ["id", "name", "city", "state", "country"];
var formColumns = displayColumns.slice(1);

Template.body.helpers({
  Griddle: function () {
    return Griddle;
  },
  columns: function () {
    return displayColumns;
  },
  formColumns: function () {
    return formColumns;
  },
  players: function () {
    return Players.find().fetch();
  }
});

Template.body.events({
  'submit #add-new-player-form': function (e) {
    e.preventDefault();
    var formData = new FormData(e.target);
    var player = {};
    formColumns.forEach(function (col) {
      player[col] = formData.get(col);
    });
    player.id = Players.find().count();
    Players.insert(player);
    e.target.reset();
  }
});
