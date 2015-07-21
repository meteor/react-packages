// Don't clobber the copy of React in react-runtime-dev if there is one,
// as far as the devtools are concerned.

__REACT_DEVTOOLS_GLOBAL_HOOK__ = {}; // shadow the global with a package-local

if (typeof window !== 'undefined' &&
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ &&
    ! Package["react-runtime-dev"]) {
  __REACT_DEVTOOLS_GLOBAL_HOOK__ =
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
}
