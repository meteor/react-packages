# JSX

A build plugin that compiles files with the `.jsx` extension from JSX to plain
JavaScript. Also transpiles some of the most useful ES6 features.

XXX list of ES6 features here.

### JSX before compilation

```jsx
var HelloMessage = React.createClass({
  render: function() {
    return <div>Hello {this.props.name}</div>;
  }
});

React.render(<HelloMessage name="John" />, mountNode);
```

### JavaScript after compilation

```js
var HelloMessage = React.createClass({displayName: "HelloMessage",
  render: function() {
    return React.createElement("div", null, "Hello ", this.props.name);
  }
});

React.render(React.createElement(HelloMessage, {name: "John"}), mountNode);
```
