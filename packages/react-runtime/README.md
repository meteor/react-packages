# react-runtime

Imports Facebook's React user interface library into your app. Access it from
the `React` namespace. Includes the development or production versions,
depending on the mode in which your app is running.

This package only provides the runtime library. If you need JSX compilation,
Meteor reactive data integration, and other commonly used functionality, add
the `react` package (which includes `react-runtime`) instead.

To learn how to use it, go to the [React website](https://facebook.github.io/react/).

```js
// Code sample of using React without JSX
var HelloMessage = React.createClass({
  displayName: "HelloMessage",
  render: function() {
    return React.createElement("div", null, "Hello ", this.props.name);
  }
});

ReactDOM.render(React.createElement(HelloMessage, {name: "John"}), mountNode);
```

Check out the [React article](http://guide.meteor.com/react.html) in the Meteor Guide to learn how to use Meteor and React together to build awesome apps.
