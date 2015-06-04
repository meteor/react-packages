Lets you easily include React components in Meteor templates. Pass the
component class through the `component` argument. The component passed
can be either a string, which is looked up in the global namespace, or
a component class directly.

Examples:

```html
<template name="Dropdown">
  <div>
    {{> React component=dropdown options=options value=selected onChange=onChange}}
  </div>
</template>
```

```js
Template.Dropdown.onCreated(function () {
  this.state = new ReactiveDict;
  this.state.set("selected", null);
});

Template.Dropdown.helpers({
  dropdown: Dropdown,
  options: [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
    {
      type: 'group', name: 'group1', items: [
        { value: 'three', label: 'Three' },
        { value: 'four', label: 'Four' }
      ]
    }
  ],
  selected: function () {
    return Template.instance().state.get("selected");
  },
  onChange: MeteorReact.asCallback(function (option) {
    tmpl.state.set("selected", option);
  })
});
```
