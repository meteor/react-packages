Meteor.publish("react-meteor-data-mixin-sub", function (num) {
  Meteor.defer(() => {  // because subs are blocking
    this.added("react-meteor-data-mixin-coll", 'id'+num, {});
    this.ready();
  });
});
