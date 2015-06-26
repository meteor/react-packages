# babel-runtime

Meteor maintains a version of the runtime helpers needed by Babel-transpiled code.
In most cases, the code is copied from Babel's helper implementations, though we
have also made some changes.

Benefits of maintaining our own package include:

* IE 8 support.  Babel's helpers target IE 9, but generally IE 8 support can be
  achieved with only minor sacrifices.

* Backwards-compatibility.  When the Babel compiler changes, the helpers sometimes
  change.  Our Babel package can keep old helpers for back-compat.  (If we change
  over to publishing original ES6 code in packages instead of transpiled code, this
  becomes less important.)

* Client-side code size.  We've made the helpers file as small as possible.
