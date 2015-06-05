<h1>Getting started with React in Meteor</h1>

Using Meteor and React together is awesome. Meteor gives you a fast, easy to use solution
for client-side data management, and React gives you a way to structure your app's UI from reusable components.

## Quick start

If you want to get going as fast as possible, you just need to add the `react` package that bundles together everything you need:

```
meteor add react
```

### What's in the box?

1. The `React` runtime library for defining and rendering components
2. A compiler that automatically transforms `.jsx` files into JavaScript, and lets you use some ES6 features
3. A React mixin called `MeteorDataMixin` that lets you easily use data from Meteor collections and other reactive sources in your components

### Next steps

Now that you have created an app and added everything you need, do these next:

1. Follow the [tutorial](tutorial.md)
2. Check out the example apps

## Adding individual packages

If you would rather pick and choose individual packages to include rather than using the `react` meta-package, you can include one or more of the following:

1. `react-runtime` - the React library itself
2. `jsx` - a compiler to compile files with the `.jsx` extension to JavaScript
3. `react-meteor-data` - a mixin to integrate Meteor reactive data sources with React components
4. `react-template-helper` - include a React component inside your Meteor template