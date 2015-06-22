Template.EmptyComponentTemplateWithoutContainerElement.helpers({
  emptyComponent() {
    return EmptyReactComponent;
  }
});

Template.UsesTextReactComponent.helpers({
  textComponent() {
    return TextReactComponent;
  }
});

Template.UsesClickableReactComponent.onCreated(function () {
  this.clicked = false;
});

Template.UsesClickableReactComponent.helpers({
  clickableComponent() {
    return ClickableReactComponent;
  }
});

Template.UsesUnmountableComponent.helpers({
  unmountableComponent() {
    return UnmountableReactComponent;
  }
});
