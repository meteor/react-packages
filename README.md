# react-packages

Meteor packages for a great React developer experience

[Read the guide.](http://react-in-meteor.readthedocs.org/en/latest/)

### Running the docs site locally

1. Install `mkdocs` with `pip`
2. Run `mkdocs serve` from the root of the repository

### Linting

Run

```
npm run lint
```

Note this does not yet all lint. Working on it.

### Testing

Due to difficulties in testing packages with "peer" NPM dependencies, we've worked around by moving package tests into harness test apps. You can find them in `tests/`.