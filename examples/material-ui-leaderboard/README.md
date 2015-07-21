# Material UI Leaderboard

<img src="https://raw.githubusercontent.com/meteor/react-packages/master/examples/material-ui-leaderboard/screenshot.png" width="400">

This is an example of building the leaderboard app using React and the [Material UI](http://material-ui.com/) components library.

### Using Packages from NPM

We are using [meteorhacks:npm](https://atmospherejs.com/meteorhacks/npm) and [cosmos:browserify](https://atmospherejs.com/cosmos/browserify) to build and use the `material-ui` NPM package on the client side. NPM dependencies are declared in [`packages.json`](https://github.com/meteor/react-packages/blob/master/examples/material-ui-leaderboard/packages.json) and loaded in [`client/lib/app.browserify.js`](https://github.com/meteor/react-packages/blob/master/examples/material-ui-leaderboard/client/lib/app.browserify.js).

See more details on using client side NPM packages in [this guide](http://react-in-meteor.readthedocs.org/en/latest/client-npm/).
