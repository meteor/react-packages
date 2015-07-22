# React in Blaze Example

This example demonstrates using 3rd-party React components inside a Blaze app.

### Using Packages from NPM

We are using [meteorhacks:npm](https://atmospherejs.com/meteorhacks/npm) and [cosmos:browserify](https://atmospherejs.com/cosmos/browserify) to build and use the `griddle-react` NPM package on the client side. NPM dependencies are declared in [`packages.json`](https://github.com/meteor/react-packages/blob/master/examples/react-in-blaze/packages.json) and required in [`client/lib/app.browserify.js`](https://github.com/meteor/react-packages/blob/master/examples/react-in-blaze/client/lib/app.browserify.js).

For more details on using client-side NPM packages, see [this guide](http://react-in-meteor.readthedocs.org/en/latest/client-npm/).

### Using React Components inside Blaze

To use React components inside Blaze, you need to first install the `react-template-helper` package. The component also needs to be made available in a helper for the Blaze template using it (see [client/app.js](https://github.com/meteor/react-packages/blob/master/examples/react-in-blaze/client/app.js#L5-L7)). Then you can use it inside your Blaze template using the `React` helper (see [client/app.html](https://github.com/meteor/react-packages/blob/master/examples/react-in-blaze/client/app.html#L15-L21)).

For more details on using the React template helper, see [this guide](http://react-in-meteor.readthedocs.org/en/latest/react-template-helper/).
