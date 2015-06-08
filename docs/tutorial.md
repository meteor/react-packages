<h1>Meteor and React integration tutorial</h1>

This short tutorial will get you acquainted with building a simple app that uses Meteor and React together. This isn't meant to be an introduction to React itself; if you haven't yet, [read Facebook's tutorial about React](https://facebook.github.io/react/docs/tutorial.html) to get acquainted.

## Step 1: Creating an app, adding React

In your terminal, type the following:

```sh
meteor create my-react-app
cd my-react-app
meteor add react
```

To run your app, type the `meteor` command in your app directory.

## Step 2: Adding your first component

First, let's delete the `my-react-app.js` file that Meteor generated for us, and everything except the `<head>...</head>` tag in `my-react-app.html`. Instead of writing HTML, we'll be constructing our page from React components.

We'll write our code in a new file we'll call `my-react-app.jsx`. In that file, put the following code:

```js
var App = React.createClass({
  render: function () {
    return <div>Hello world!</div>;
  }
});

if (Meteor.isClient) {
  React.render(<App />, document.body);
}
```

JSX is a special file format that React developers use which lets you embed snippets of HTML-like markup inside your JavaScript. This markup is compiled to regular JavaScript code by Meteor. [Read more about JSX here.](jsx.md)

In this file we just created, we have defined a React component with `createClass` and then rendered it to the `<body>` element of the page. If you run your app, you will see the text `Hello world!` displayed on the screen, indicating that you have successfully compiled and run an app with Meteor and React. Congratulations!

Read on to see how to use Meteor data in your component.

## Step 3: Displaying reactive data

Add a collection, blah blah

```js
var Tasks = new Mongo.Collection("tasks");

var App = React.createClass({
  mixins: [MeteorDataMixin],
  trackMeteorData() {
    // This function knows how to listen to Meteor's reactive data sources,
    // such as collection queries
    return {
      // Returns an array with all items in the collection
      tasks: Tasks.find().fetch()
    }
  },
  render() {
    return <ul>{
      // Access the data from trackMeteorData() on this.data
      this.data.tasks.map(function (task) {
        return <li>task.content</li>
      })
    }</ul>;
  }
});

if (Meteor.isClient) {
  React.render(<App />, document.body);
}
```

## Step 4: Modifying data from a user event

```js
var Tasks = new Mongo.Collection("tasks");

var List = React.createClass({
  mixins: [MeteorDataMixin],
  trackMeteorData() {
    // This function knows how to listen to Meteor's reactive data sources,
    // such as collection queries
    return {
      // Returns an array with all items in the collection
      tasks: Tasks.find().fetch()
    }
  },
  render() {
    return <ul>{
      // Access the data from trackMeteorData() on this.data
      this.data.tasks.map(function (task) {
        return <li>task.content</li>
      })
    }</ul>
  }
});

var NewTaskForm = React.createClass({
  onSubmit(event) {
    var taskContent = event.target.content.value;
    Meteor.call('insertTask', {
      content: taskContent
    });
  },
  render() {
    return <form onSubmit={this.onSubmit}>
      <input type='text' name='content' placeholder='Add a task...'/>
    </form>
  }
})

var App = React.createClass({
  render() {
    return <div>
      <List />
      <NewTaskForm />
    </div>
  }
});

Meteor.methods({
  insertTask: function (task) {
    // Validate the data
    check(content, {
      text: String
    });

    // Insert into MongoDB and Minimongo
    Tasks.insert(task);
  }
});

if (Meteor.isClient) {
  React.render(<App />, document.body);
}
```
