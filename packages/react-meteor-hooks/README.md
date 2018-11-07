## `react-meteor-data`

This package provides an integration between React Hooks and [`Tracker`](https://atmospherejs.com/meteor/tracker), Meteor's reactive data system.

### Install

To install the package, use `meteor add`:

```bash
meteor add react-meteor-hooks
```

You'll also need to install `react` if you have not already:

```bash
npm install --save react@16.7.0.alpha.0
```

### Hooks

**`useMeteorSubscription`**

It takes all arguments you would put into `Meteor.subscribe` and runs
the subscription and `ready()` checks in a `useEffect` and returns the
value of a state hook for `ready()`.

**`useMeteorData`**

This function takes a function as first parameter and runs that as an
effect hook within the meteor tracker. The second parameter is an
array of inputs that influence the effect hook.

It returns the value of the state hook that represents the return
value of the given function. This can either be an object to be
destructured later or a single value (array of collection documents or
single collection document).

### Usage

This package exports the hooks `useMeteorSubscription` and `useMeteorData`.

```js
export const Page = function (props) {
  const loading = useMeteorSubscription('links');
  const links = useMeteorData(() => Links.find().fetch());

  if(loading) return (<div>Loading links ...</div>);

  return (
    <ul>
      {links.map((link) => (
        <li key={link._id}>
          <a href={link.url} target="_blank">{link.title}</a>
        </li>
      ))}
    </ul>
  );
}
```
