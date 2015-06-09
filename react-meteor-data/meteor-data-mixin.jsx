MeteorDataMixin = {
  componentWillMount() {
    this.data = {};

    this._meteorDataManager = new MeteorDataManager();

    var newData = this._meteorDataManager.calculateData(
      this, this.props, this.state);

    this._meteorDataManager.updateData(this.data, newData);
  },
  componentWillUpdate(nextProps, nextState) {
    var newData = this._meteorDataManager.calculateData(
      this, nextProps, nextState);

    this._meteorDataManager.updateData(this.data, newData);
  },
  componentWillUnmount() {
    this._meteorDataManager.dispose();
  }
};


class MeteorDataManager {
  constructor() {
    this.computation = null;
    this.oldData = null;
  }

  dispose() {
    if (this.computation) {
      this.computation.stop();
      this.computation = null;
    }
  }

  calculateData(component, props, state) {
    if (! component.trackMeteorData) {
      return null;
    }

    if (this.computation) {
      this.computation.stop();
      this.computation = null;
    }

    var data;
    this.computation = Tracker.nonreactive(() => {
      return Tracker.autorun((c) => {
        if (c.firstRun) {
          data = component.trackMeteorData(props, state);
        } else {
          c.stop();
          component.forceUpdate();
        }
      });
    });
    return data;
  }

  updateData(componentData, newData) {
    if (! (newData && (typeof newData) === 'object')) {
      throw new Error("Expected object returned from trackMeteorData");
    }
    // update componentData in place based on newData
    for (var key in newData) {
      componentData[key] = newData[key];
    }
    // if there is oldData (which is every time this method is called
    // except the first), delete keys in newData that aren't in
    // oldData.  don't interfere with other keys, in case we are
    // co-existing with something else that writes to a component's
    // this.data.
    if (this.oldData) {
      for (var key in this.oldData) {
        if (! (key in newData)) {
          delete componentData[key];
        }
      }
    }
    this.oldData = newData;
  }
}
