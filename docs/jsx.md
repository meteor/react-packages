<h1>JSX transpilation and ES6 features</h1>

All you have to do to enable JSX transpilation in Meteor is add the `jsx` package or the `react` meta-package. Then, all files in your app with the `.jsx` extension will be transpiled automatically and loaded on the server and the client according to [Meteor's file loading rules](http://docs.meteor.com/#/full/structuringyourapp).

## What is JSX?

JSX is an extension to JavaScript that lets you write snippets of XML-like markup directly in your JavaScript, that then compile into regular JavaScript function calls. Consider the following examples, taken from the [React homepage](https://facebook.github.io/react/).

JSX before compilation:

```js
var HelloMessage = React.createClass({
  render: function() {
    return <div>Hello {this.props.name}</div>;
  }
});

ReactDOM.render(<HelloMessage name="John" />, mountNode);
```

JavaScript after compilation:

```js
var HelloMessage = React.createClass({displayName: "HelloMessage",
  render: function() {
    return React.createElement("div", null, "Hello ", this.props.name);
  }
});

ReactDOM.render(React.createElement(HelloMessage, {name: "John"}), mountNode);
```

As you can see, JSX lets you write code that looks more like HTML but is actually JavaScript, reducing the need for a completely separate templating language.

## Enabled EcmaScript transforms

The JSX transpilation also includes some commonly-used future JavaScript features. We have picked the same ones as [React Native](https://facebook.github.io/react-native/docs/javascript-environment.html#javascript-syntax-transformers), listed below:

**ES5**

- Reserved Words: `promise.catch(function() { });`

**ES6**

- Arrow functions: `<C onPress={() => this.setState({pressed: true})}`
- Call spread: `Math.max(...array);`
- Classes: `class C extends React.Component { render() { return <View />; } }`
- Destructuring: `var {isActive, style} = this.props;`
- Computed Properties: `var key = 'abc'; var obj = {[key]: 10};`
- Object Consise Method: `var obj = { method() { return 10; } };`
- Object Short Notation: `var name = 'vjeux'; var obj = { name };`
- Rest Params: `function(type, ...args) { }`
- Default Params: `function(a, b = 1) { }`
- Template Literals: ``var who = 'world'; var str = `Hello ${who}`;``

**ES7**

- Object Spread: `var extended = { ...obj, a: 10 };`
- Function Trailing Comma: `function f(a, b, c,) { }`

