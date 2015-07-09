<h1>Getting started with React in Meteor</h1>

Using Meteor and React together is awesome. Meteor gives you a fast, easy to use solution
for data management across client and server, and React gives you a way to structure your app's UI from reusable components.

We are still making improvements and investigating the best ways to use Meteor and React together, but these packages are already usable and you can download them now. Try them out and let us know what you think [on GitHub](https://github.com/meteor/react-packages/issues)!

## Quick start

If you want to get going as fast as possible, you just need to add the `react` package that bundles together everything you need:

```
meteor add react
```

### What's in the box?

The `react` meta-package comes with everything you need to build your Meteor app with React. You can also add any of the parts individually:

1. `react-runtime`: The React library itself
2. `jsx`: A compiler that automatically transforms `.jsx` files into JavaScript, and lets you use some ES6 features
3. `react-meteor-data`: A React mixin called `ReactMeteorData` that lets you easily use data from Meteor collections and other reactive sources in your components

### Next steps

Now that you have created an app and added everything you need, do these next:

1. Follow the [tutorial](tutorial.md)
2. Check out the [example apps](https://github.com/meteor/react-packages/tree/master/examples)

## Contributing and filing bugs

[See the repository on GitHub.](https://github.com/meteor/react-packages)
