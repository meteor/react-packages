/**
 * Container helper using react-meteor-data.
 */
import { connect } from './ReactMeteorData.jsx';

export default function createContainer(options = {}, Component) {
  // cheap curry
  if (Component === undefined) return createContainer.bind(createContainer, options);

  let expandedOptions = options;
  if (typeof options === 'function') {
    expandedOptions = {
      getMeteorData: options,
    };
  }

  return connect(expandedOptions)(Component);
}
