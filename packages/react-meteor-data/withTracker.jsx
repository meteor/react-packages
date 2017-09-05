import createContainer from './createContainer';

const withTracker = fn => C => createContainer(fn, C);

export default withTracker;
