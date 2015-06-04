var EmptyReactComponent = React.createClass({
  render() {
    return <div></div>
  }
});

Template.EmptyComponentTemplateWithoutContainerElement.helpers({
  emptyComponent() {
    return EmptyReactComponent;
  }
});

Tinytest.add(
  "react-template-helper-tests - rendering react component with siblings gives helpful error",
  function (test) {
    var tmpl = Template.UsesEmptyComponentTemplateWithSiblings;
    test.throws(function () {
      renderToDiv(tmpl);
      Tracker.flush({_throwFirstError: true});
    }, /EmptyComponentTemplateWithoutContainerElement.*EmptyReactComponent.*only child/);
  });