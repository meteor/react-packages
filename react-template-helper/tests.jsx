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
    var fails = function (tmpl) {
      test.throws(function () {
        renderToDiv(tmpl);
        Tracker.flush({_throwFirstError: true});
      }, /EmptyComponentTemplateWithoutContainerElement.*EmptyReactComponent.*only child/);
    };

    fails(Template.UsesEmptyComponentTemplateWithSiblingElement);
    fails(Template.UsesEmptyComponentTemplateWithSiblingTextNode);
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

Tinytest.add(
  "react-template-helper-tests - pass props into `{{> React}}`",
  function (test) {
    var tmpl = Template.UsesTextReactComponent;
    var text = new ReactiveVar("one");
    tmpl.helpers({
      text() {
        return text.get();
      }
    });

    var div = renderToDiv(tmpl);
    Tracker.flush({_throwFirstError: true});
    test.equal(canonicalizeHtml($(div).text()), "one");
    text.set("two");
    Tracker.flush({_throwFirstError: true});
    test.equal(canonicalizeHtml($(div).text()), "two");
  });

Tinytest.add(
  "react-template-helper-tests - pass callbacks into `{{> React}}`",
  function (test) {
    var tmpl = Template.UsesClickableReactComponent;
    var reactiveNum = new ReactiveVar(1);
    var numWhenClicked = 0;
    tmpl.helpers({
      onClick: function () {
        // intentionally call `get` outside of the callback function inside
        // so that we test replacing the callback with a different one.
        var num = reactiveNum.get();
        return function () {
          numWhenClicked = num;
        }
      }
    });

    var div = renderToDiv(tmpl);
    Tracker.flush({_throwFirstError: true});
    document.body.appendChild(div);

    test.equal(numWhenClicked, 0);
    clickIt(div.querySelector(".click-me"));
    test.equal(numWhenClicked, 1);
    reactiveNum.set(2);
    Tracker.flush({_throwFirstError: true});
    clickIt(div.querySelector(".click-me"));
    test.equal(numWhenClicked, 2);

    document.body.removeChild(div);
  });

Tinytest.add(
  "react-template-helper-tests - pass changing component to `{{> React}}`",
  function (test) {
    var tmpl = Template.UsesGenericComponent;

    var component = new ReactiveVar(OneReactComponent);
    tmpl.helpers({
      component() {
        return component.get();
      }
    });

    var div = renderToDiv(tmpl);

    Tracker.flush({_throwFirstError: true});
    test.equal($(div).text(), "One");

    component.set(TwoReactComponent);
    Tracker.flush({_throwFirstError: true});
    test.equal($(div).text(), "Two");
  });

