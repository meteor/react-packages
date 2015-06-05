<h1>Including React components inside Meteor templates</h1>

We have built a convenient package that enables you to use React components anywhere inside an existing Meteor app that uses Blaze, Meteor's default built-in templating system. You can use this if you are interested in building part of your UI with reusable React components, or if you are looking to gradually transition your entire app to React.

To start, add the package:

```sh
meteor add react-template-helper
```

## Including a component

To include a React component inside your Blaze template, use the `React` template like so:

```html
<template name="userDisplay">
  <div>Hello, {{username}}</div>
  <div>{{> React component=UserAvatar propA=_id}}</div>
</template>
```

The `component` argument is the React component to include, which should be passed in with a helper. Every other argument is passed as a prop to the component when it is rendered.

## React components must be the only thing in the wrapper element

Due to a limitation of React (see facebook/react [#1970](https://github.com/facebook/react/issues/1970), [2484](https://github.com/facebook/react/issues/2484)), a React component must be rendered as the only child of its parent node, meaning it cannot have any siblings.

**Below code samples will throw an error!**

React components can't have siblings:

```html
<template name="userDisplay">
  <div>
    <div>Hello, {{username}}</div>
    {{> React component=UserAvatar propA=_id}}
  </div>
</template>
```

A component also can't be the only thing in a template, because it's impossible to tell where the template will be used:

```html
<template name="userDisplay">
  {{> React component=UserAvatar propA=_id}}
</template>
```