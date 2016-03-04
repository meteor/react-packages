This is an app that simply a test harness for the `react-runtime` package. 

To run it in development mode:

```
npm install
PACKAGE_DIRS=../../packages meteor test --driver-package avital:mocha
open localhost:3000
```

In production mode:
```
npm install
PACKAGE_DIRS=../../packages meteor test --production --driver-package avital:mocha
open localhost:3000
```


(Todo: console testing w/ spacejam)