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
  "react-template-helper-tests - must pass `component` into `{{> React}}`",
  function (test) {
    test.throws(function () {
      renderToDiv(Template.ReactTemplateWithoutComponent);
      Tracker.flush({_throwFirstError: true});
    }, /`{{> React ... }}` missing `component`/);
  });

Tinytest.add(
  "react-template-helper-tests - rendering react component with sibling gives helpful error",
  function (test) {
    var tmpl = Template.UsesEmptyComponentTemplateWithSibling;
    test.throws(function () {
      renderToDiv(tmpl);
      Tracker.flush({_throwFirstError: true});
    }, /EmptyComponentTemplateWithoutContainerElement.*EmptyReactComponent.*only child/);
  });


/**
  Test disabled: The following detection may not be possible at
  run-time. When React renders a component it clears its container
  element, so any Blaze marker nodes used to know where to insert a new
  element are lost. We get a "Failed to execute 'removeChild' on 'Node':
  The node to be removed is not a child of this node."

Tinytest.add(
  "react-template-helper-tests - rendering react component with conditional sibling gives helpful error",
  function (test) {
    var tmpl = Template.UsesEmptyComponentTemplateWithConditionalSibling;
    var sibling = new ReactiveVar(false);
    tmpl.helpers({
      sibling() {
        return sibling.get();
      }
    });

    // shouldn't throw
    renderToDiv(tmpl);
    Tracker.flush({_throwFirstError: true});

    test.throws(function () {
      sibling.set(true);
      Tracker.flush({_throwFirstError: true});
    }, /EmptyComponentTemplateWithoutContainerElement.*EmptyReactComponent.*only child/);
  });
*/
