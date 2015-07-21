# React Todos

This example app is a port of the standard Meteor Todos example app to use React for all of the view code. It demostrates a variety of Meteor+React techniques, listed below:

### Routing with React Router

Check out [routes.jsx](client/routes.jsx). You can see how each route corresponds to a React component, and the routes can be nested to make `AppBody` act as a layout. The app is rendered inside a container element on the page (defined in [index.html](index.html)) to avoid conflicting with any libraries that expect to be able to add extra elements to the `body` tag.

### Data loading components

It can be advantageous to limit your data loading logic to a few key components. In this app, those components are [AppBody](client/components/AppBody.jsx) and [TodoListPage](client/components/todo-list/TodoListPage.jsx). They use the `ReactMeteorData` mixin to load data inside a special method called `getMeteorData`, and pass it to their children via `props`.

### Manipulating data inside methods

The Meteor methods we define in [lists.js](lib/lists.js) and [todos.js](lib/todos.js) act as an API or controller layer to our app. We can see all of the data operations done in our app by reading these methods. This would be the best place to add security rules.

The methods are mostly called from inside event handlers, like in [TodoListHeader](client/components/TodoListHeader.jsx), which is in charge of list title editing, task creation, list privacy settings, and list deletion.
