## ReactMeteorData

```
Foo = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(props, state) {
    return {
      foo: Session.get('foo')
    };
  },
  render() {
    return <span>{this.data.foo}</span>
  }
});
```
