Lists = new Mongo.Collection('lists');

// Calculate a default name for a list in the form of 'List A'
Lists.defaultName = function() {
  var nextLetter = 'A', nextName = 'List ' + nextLetter;
  while (Lists.findOne({name: nextName})) {
    // not going to be too smart here, can go past Z
    nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
    nextName = 'List ' + nextLetter;
  }

  return nextName;
};

Meteor.methods({
  '/lists/add': function () {
    var list = {
      name: Lists.defaultName(),
      incompleteCount: 0,
      createdAt: new Date()
    };

    var listId = Lists.insert(list);

    return listId;
  },
  '/lists/updateName': function (listId, newName) {
    Lists.update(listId, {
      $set: { name: newName }
    });
  },
  '/lists/togglePrivate': function (listId) {
    var list = Lists.findOne(listId);

    if (! Meteor.user()) {
      throw new Meteor.Error("not-logged-in");
    }

    if (list.userId) {
      Lists.update(list._id, {$unset: {userId: true}});
    } else {
      // ensure the last public list cannot be made private
      if (Lists.find({userId: {$exists: false}}).count() === 1) {
        throw new Meteor.Error("final-list-private");
      }

      Lists.update(list._id, {$set: {userId: Meteor.userId()}});
    }
  },
  '/lists/delete': function (listId) {
    var list = Lists.findOne(listId);

    // ensure the last public list cannot be deleted.
    if (! list.userId && Lists.find({userId: {$exists: false}}).count() === 1) {
      throw new Meteor.Error("final-list-delete");
    }

    // Make sure to delete all of the items
    Todos.remove({listId: list._id});

    // Delete the list itself
    Lists.remove(list._id);
  },
  '/lists/addTask': function (listId, newTaskText) {
    Todos.insert({
      listId: listId,
      text: newTaskText,
      checked: false,
      createdAt: new Date()
    });

    Lists.update(listId, {$inc: {incompleteCount: 1}});
  }
});
