Todos = new Mongo.Collection('todos');

Meteor.methods({
  '/todos/delete': function (todoId) {
    var todo = Todos.findOne(todoId);

    Todos.remove(todoId);
    if (! todo.checked) {
      Lists.update(todo.listId, {$inc: {incompleteCount: -1}});
    }
  },
  '/todos/setChecked': function (todoId, checked) {
    var todo = Todos.findOne(todoId);

    Todos.update(todoId, {$set: {checked: checked}});
    Lists.update(todo.listId, {$inc: {incompleteCount: checked ? -1 : 1}});
  },
  '/todos/setText': function (todoId, newText) {
    Todos.update(todoId, {$set: {text: newText}});
  }
});
