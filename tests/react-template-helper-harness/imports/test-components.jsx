import React from 'react';

const EmptyReactComponent = React.createClass({
  render() {
    return <div></div>
  }
});

const TextReactComponent = React.createClass({
  propTypes: {
    text: React.PropTypes.string.isRequired
  },
  render() {
    return <div>{this.props.text}</div>
  }
});

const ClickableReactComponent = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func.isRequired
  },
  render() {
    return <div className="click-me" onClick={this.props.onClick}></div>;
  }
});

const OneReactComponent = React.createClass({
  render() {
    return <div>One</div>;
  }
});

const TwoReactComponent = React.createClass({
  render() {
    return <div>Two</div>;
  }
});

const UnmountableReactComponent = React.createClass({
  propTypes: {
    onUnmounted: React.PropTypes.func.isRequired
  },
  render() {
    return <div></div>;
  },
  componentWillUnmount() {
    this.props.onUnmounted();
  }
});

export {
  EmptyReactComponent,
  TextReactComponent,
  ClickableReactComponent,
  OneReactComponent,
  TwoReactComponent,
  UnmountableReactComponent
};