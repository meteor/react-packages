declare var Package: any
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { useReducer, useState, useEffect, useRef, useMemo, DependencyList } from 'react';

// Warns if data is a Mongo.Cursor or a POJO containing a Mongo.Cursor.
function checkCursor (data: any): void {
  let shouldWarn = false;
  if (Package.mongo && Package.mongo.Mongo && data && typeof data === 'object') {
    if (data instanceof Package.mongo.Mongo.Cursor) {
      shouldWarn = true;
    } else if (Object.getPrototypeOf(data) === Object.prototype) {
      Object.keys(data).forEach((key) => {
        if (data[key] instanceof Package.mongo.Mongo.Cursor) {
          shouldWarn = true;
        }
      });
    }
  }
  if (shouldWarn) {
    console.warn(
      'Warning: your reactive function is returning a Mongo cursor. '
      + 'This value will not be reactive. You probably want to call '
      + '`.fetch()` on the cursor before returning it.'
    );
  }
}

// Used to create a forceUpdate from useReducer. Forces update by
// incrementing a number whenever the dispatch method is invoked.
const fur = (x: number): number => x + 1;
const useForceUpdate = () => useReducer(fur, 0)[1];

type ReactiveFn = (c?: Tracker.Computation) => any;
type TrackerRefs = {
  computation?: Tracker.Computation;
  isMounted: boolean;
  trackerData: any;
}

const useTrackerNoDeps = (reactiveFn: ReactiveFn) => {
  const { current: refs } = useRef<TrackerRefs>({
    isMounted: false,
    trackerData: null
  });
  const forceUpdate = useForceUpdate();

  // Without deps, always dispose and recreate the computation with every render.
  if (refs.computation) {
    refs.computation.stop();
    // @ts-ignore This makes TS think ref.computation is "never" set
    refs.computation;
  }

  // Use Tracker.nonreactive in case we are inside a Tracker Computation.
  // This can happen if someone calls `ReactDOM.render` inside a Computation.
  // In that case, we want to opt out of the normal behavior of nested
  // Computations, where if the outer one is invalidated or stopped,
  // it stops the inner one.
  Tracker.nonreactive(() => Tracker.autorun((c: Tracker.Computation) => {
    refs.computation = c;
    if (c.firstRun) {
      // Always run the reactiveFn on firstRun
      const data = reactiveFn(c);
      if (Meteor.isDevelopment) {
        checkCursor(data);
      }
      refs.trackerData = data;
    } else {
      // For any reactive change, forceUpdate and let the next render rebuild the computation.
      forceUpdate();
    }
  }));

  // To avoid creating side effects in render with Tracker when not using deps
  // create the computation, run the user's reactive function in a computation synchronously,
  // then immediately dispose of it. It'll be recreated again after the render is committed.
  if (!refs.isMounted) {
    // We want to forceUpdate in useEffect to support StrictMode.
    // See: https://github.com/meteor/react-packages/issues/278
    if (refs.computation) {
      refs.computation.stop();
      delete refs.computation;
    }
  }

  useEffect(() => {
    // Let subsequent renders know we are mounted (render is comitted).
    refs.isMounted = true;

    // Render is committed. Since useTracker without deps always runs synchronously,
    // forceUpdate and let the next render recreate the computation.
    forceUpdate();

    // stop the computation on unmount
    return () =>{
      refs.computation?.stop();
    }
  }, []);

  return refs.trackerData;
}

const useTrackerClient = <T = any>(reactiveFn: () => T, deps: DependencyList): T => {
  let [data, setData] = useState<T>();

  useMemo(() => {
    // To avoid creating side effects in render, opt out
    // of Tracker integration altogether.
    data = Tracker.nonreactive(reactiveFn)
    if (Meteor.isDevelopment) {
      checkCursor(data);
    }
  }, deps);

  useEffect(() => {
    const computation = Tracker.autorun(() => {
      setData(reactiveFn());
    });
    return () => {
      computation.stop();
    }
  }, deps);

  return data as T;
}

const useTrackerServer = <T = any>(reactiveFn: () => T): T =>
  Tracker.nonreactive(reactiveFn);

// When rendering on the server, we don't want to use the Tracker.
// We only do the first rendering on the server so we can get the data right away
const useTracker = Meteor.isServer
  ? useTrackerServer
  : useTrackerClient;

const useTrackerDev = <T = any>(reactiveFn: () => T, deps: DependencyList): T => {
  if (typeof reactiveFn !== 'function') {
    console.warn(
      'Warning: useTracker expected a function in it\'s first argument '
      + `(reactiveFn), but got type of ${typeof reactiveFn}.`
    );
  }
  if (!Array.isArray(deps)) {
    console.warn(
      'Warning: useTracker expected an array in it\'s second argument '
      + `(dependency), but got type of ${typeof deps}.`
    );
  }
  return useTracker(reactiveFn, deps);
}

export default Meteor.isDevelopment
  ? useTrackerDev
  : useTracker;

export const useTrackerLegacy = Meteor.isServer
? useTrackerServer
: useTrackerNoDeps;
