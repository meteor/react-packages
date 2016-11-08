declare module 'meteor/react-meteor-data' {
  // `T` is external props.
  // `U` is Meteor container props.
  export const createContainer: <T, U>(
    fun: (props: T) => U,
    comp: React.ComponentClass<U & T> | React.StatelessComponent<U & T>)
      => React.ComponentFactory<T, any>;
}
