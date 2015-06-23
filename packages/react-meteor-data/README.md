## ReactMeteorData

```
Foo = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData() {
    // do all your reactive data access here
    return {
      foo: Session.get('foo')
      // (you can also access this.props and this.state here)
    };
  },
  render() {
    return <span>{this.data.foo}</span>
  }
});
```
