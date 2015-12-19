React = require("react");
ReactDOM = require("react-dom");

if (Meteor.isServer) {
  ReactDOMServer = require("react-dom/server");
}

// Addons
React.addons = {
  TransitionGroup   : require('react-addons-transition-group'),
  CSSTransitionGroup: require('react-addons-css-transition-group'),
  LinkedStateMixin  : require('react-addons-linked-state-mixin'),
  createFragment    : require('react-addons-create-fragment'),
  update            : require('react-addons-update'),
  PureRenderMixin   : require('react-addons-pure-render-mixin')
};
