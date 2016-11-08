declare module 'meteor/react-meteor-data' {
  export const createContainer: <T, U>(
    fun: (props: T) => U,
    comp: React.ComponentClass<U & T> | React.StatelessComponent<U & T>)
      => React.ComponentFactory<T, any>;
}
