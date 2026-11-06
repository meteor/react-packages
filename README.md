# react-packages

Meteor packages for a great React developer experience

[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](http://www.repostatus.org/badges/latest/wip.svg)](http://www.repostatus.org/#wip)

## Linting

Run
```
npm run lint
```

Note: this does not yet lint all files. Working on it.

## Testing

Meteor packages in this repo (e.g., `react-runtime`, `react-meteor-data`) have **peer dependencies** installed via NPM (see each package's `package.json`).

Due to how Meteor handles peer dependencies, **you cannot run `meteor test-packages` directly from this repo**. Instead, tests are run inside **test harness apps** located in the `tests/` directory.

### Prerequisites

- Meteor >= 3.1.2
- Node >= 18 (v18 recommended for Meteor 3.x)
- If you're on Apple Silicon (M1/M2/M3), you may need to run Meteor CLI under Rosetta: `arch -x86_64 meteor`

### Test Harnesses

| Harness app | Tests |
|---|---|
| `tests/react-meteor-data-harness/` | `react-meteor-data` package |
| `tests/react-meteor-accounts-harness/` | `react-meteor-accounts` package |

### Running Tests Locally (Browser Mode)

1. Open a terminal and `cd` into the harness app directory:
   ```bash
   # Example for react-meteor-data:
   cd tests/react-meteor-data-harness
   meteor npm install
   METEOR_PACKAGE_DIRS=../../packages meteor run
   ```

2. In a new terminal window, run the tests:
   ```bash
   cd tests/react-meteor-data-harness
   METEOR_PACKAGE_DIRS=../../packages meteor test-packages --driver-package meteortesting:mocha ./packages/react-meteor-data
   ```

3. Open your browser and visit `http://localhost:3000` to see the test results.

> **Tip:** The `METEOR_PACKAGE_DIRS=../../packages` environment variable tells Meteor to load the local package source (from this repo's `packages/` directory) instead of the published version.

### Running Tests in CI / Headless Mode

This repo uses [`@zodern/mtest`](https://github.com/zodern/mtest) for headless testing in CI.

To run all package tests headlessly (same as CI):

```bash
npx @zodern/mtest
```

To run tests for a specific package only:

```bash
npx @zodern/mtest --package ./packages/react-meteor-data
```

See `.github/workflows/test-react-packages.yml` for the full CI configuration.

### Common Issues

- **`Cannot find module 'react'`**: Make sure you ran `meteor npm install` inside the harness app directory first. React is a peer dependency and must be installed via NPM.
- **Tests hang / M1/M2 Mac**: Try running Meteor under Rosetta: `arch -x86_64 meteor test-packages ...`
- **`@zodern/mtest` not found**: Run `npx @zodern/mtest` from the repo root. If it still fails, check that Node >= 18 is installed.
