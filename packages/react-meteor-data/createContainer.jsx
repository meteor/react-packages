/**
 * Container helper using react-meteor-data.
 */

import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import ReactMeteorData from './ReactMeteorData.jsx';

export default function createContainer(options = {}, Component) {
  let expandedOptions = options;
  if (typeof options === 'function') {
    expandedOptions = {
      getMeteorData: options,
    };
  }

  const {
    getInitialState = function () { return null; },
    getMeteorData,
    pure = true,
  } = expandedOptions;

  const mixins = [ReactMeteorData];
  if (pure) {
    mixins.push(PureRenderMixin);
  }

  /* eslint-disable react/prefer-es6-class */
  return React.createClass({
    displayName: 'MeteorDataContainer',
    mixins,
    getInitialState() {
      return getInitialState(this.props);
    },
    getMeteorData() {
      return getMeteorData.call({ state: this.state }, this.props, this.state);
    },
    render() {
      return <Component {...this.props} {...this.data} />;
    },
  });
}
