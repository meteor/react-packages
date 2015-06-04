<h1>Using client-side modules from NPM with Browserify</h1>

Many useful React components and React-related modules are available on NPM, and can be bundled for the client with the popular Browserify tool. Meteor currently doesn't have first-party support for using these modules, but there are some community-maintained packages that work great!

## cosmos:browserify and meteorhacks:npm

- `cosmos:browserify` [GitHub page](https://github.com/elidoran/cosmos-browserify/), [Atmosphere page](https://atmospherejs.com/cosmos/browserify)
- `meteorhacks:npm` [GitHub page](https://github.com/meteorhacks/npm), [Atmosphere page](https://atmospherejs.com/meteorhacks/npm)

You can use this package along with `meteorhacks:npm` to include NPM modules on the client. Here's how:

### 1. Add the relevant Meteor packages

```sh
meteor add meteorhacks:npm cosmos:browserify
```

### 2. Add the npm modules you want to packages.json

After you have added the packages, run your app once to let some initial setup happen. Then, you should have a file called `packages.json` in the root of your app. Put any NPM packages you would like to load here. We'll use `react-router` as an example:

```js
{
  "react-router": "0.13.3"
}
```

### 3. Add the appropriate require statements to app.browserify.js

Currently, Meteor doesn't support using `require` to load modules, so we will use a special file supported by `cosmos:browserify` to enable this. In the root of your app directory, create a file called `app.browserify.js`. Inside it, you can require any of the NPM modules you loaded, and export them as "app-scope" variables, meaning they will be accessible in every JavaScript file in your app. For example, for `react-router` you might do:

```js
// In app.browserify.js
ReactRouter = require("react-router");
```

Now, you can use React Router anywhere! You can use the same method to load any React component modules you find on [react-components.com](http://react-components.com/).
