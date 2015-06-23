ReactMeteorData = {
  componentWillMount() {
    this.data = {};
    this._meteorDataManager = new MeteorDataManager(this);
    const newData = this._meteorDataManager.calculateData();
    this._meteorDataManager.updateData(newData);
  },
  componentWillUpdate(nextProps, nextState) {
    const saveProps = this.props;
    const saveState = this.state;
    let newData;
    try {
      // Temporarily assign this.state and this.props,
      // so that they are seen by getMeteorData!
      // This is a simulation of how the proposed Observe API
      // for React will work, which calls observe() after
      // componentWillUpdate and after props and state are
      // updated, but before render() is called.
      this.props = nextProps;
      this.state = nextState;
      newData = this._meteorDataManager.calculateData();
    } finally {
      this.props = saveProps;
      this.state = saveState;
    }

    this._meteorDataManager.updateData(newData);
  },
  componentWillUnmount() {
    this._meteorDataManager.dispose();
  }
};

// A class to keep the state and utility methods needed to manage
// the Meteor data for a component.
class MeteorDataManager {
  constructor(component) {
    this.component = component;
    this.computation = null;
    this.oldData = null;
  }

  dispose() {
    if (this.computation) {
      this.computation.stop();
      this.computation = null;
    }
  }

  calculateData() {
    const component = this.component;
    const {props, state} = component;

    if (! component.getMeteorData) {
      return null;
    }

    if (this.computation) {
      this.computation.stop();
      this.computation = null;
    }

    let data;
    this.computation = Tracker.nonreactive(() => {
      return Tracker.autorun((c) => {
        if (c.firstRun) {
          data = component.getMeteorData();
        } else {
          c.stop();
          component.forceUpdate();
        }
      });
    });
    return data;
  }

  updateData(newData) {
    const component = this.component;

    if (! (newData && (typeof newData) === 'object')) {
      throw new Error("Expected object returned from getMeteorData");
    }
    // update componentData in place based on newData
    for (let key in newData) {
      component.data[key] = newData[key];
    }
    // if there is oldData (which is every time this method is called
    // except the first), delete keys in newData that aren't in
    // oldData.  don't interfere with other keys, in case we are
    // co-existing with something else that writes to a component's
    // this.data.
    if (this.oldData) {
      for (let key in this.oldData) {
        if (! (key in newData)) {
          delete component.data[key];
        }
      }
    }
    this.oldData = newData;
  }
}
