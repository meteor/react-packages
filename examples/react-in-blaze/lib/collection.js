Players = new Mongo.Collection('players');

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      [
        {
          "id": 0,
          "name": "Mayer Leonard",
          "city": "Kapowsin",
          "state": "Hawaii",
          "country": "United Kingdom"
        },
        {
          "id": 1,
          "name": "Koch Becker",
          "city": "Johnsonburg",
          "state": "New Jersey",
          "country": "Madagascar"
        },
        {
          "id": 2,
          "name": "Lowery Hopkins",
          "city": "Blanco",
          "state": "Arizona",
          "country": "Ukraine"
        },
        {
          "id": 3,
          "name": "Walters Mays",
          "city": "Glendale",
          "state": "Illinois",
          "country": "New Zealand"
        },
        {
          "id": 4,
          "name": "Shaw Lowe",
          "city": "Coultervillle",
          "state": "Wyoming",
          "country": "Ecuador"
        }
      ].forEach(function (player) {
        Players.insert(player);
      });
    }
  });
}
