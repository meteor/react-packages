Tests of the `babel-compiler` package.

These tests are in their own package because putting them in the
`babel` package would create a build-time circular dependency.  A
package containing transpiled files can only be built after `babel`
is already built.
