## MeteorDataMixin

```
Foo = React.createClass({
  mixins: [MeteorDataMixin],
  trackMeteorData(props, state) {
    return {
      foo: Session.get('foo')
    };
  },
  render() {
    return <span>{this.data.foo}</span>
  }
});
```
