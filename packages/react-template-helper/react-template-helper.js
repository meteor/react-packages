// Empty template; logic in `onRendered` below
Template.React = new Template("Template.React", function () { return []; });

Template.React.onRendered(function () {
  var parentTemplate = parentTemplateName();
  var container = this.firstNode.parentNode;
  this.container = container;

  this.autorun(function (c) {
    var data = Blaze.getData();

    var comp = data && data.component;
    if (! comp) {
      throw new Error(
        "In template \"" + parentTemplate + "\", call to `{{> React ... }}` missing " +
          "`component` argument.");
    }

    // Remove this block of code once we ship Meteor 1.1.1 or above,
    // where we detect these cases (and more) when templates are
    // compiled:
    // https://github.com/meteor/meteor/commit/29d907e8365fa28b22994cb63311de60fd58cc1f

    // expected nodes that aren't whitespace-only text nodes
    var expectedContainerChildNodes = c.firstRun ? 0 : 1;
    if (numChildNodes(container) > expectedContainerChildNodes) {
      var compDescriptor = comp.displayName
            ? "the React component " + comp.displayName
            : "a React component";

      throw new Error(
        "Template \"" + parentTemplate + "\" must render " + compDescriptor +
          " as the only child of its parent element. Learn more at " +
          "https://github.com/meteor/meteor/wiki/React-components-must-be-the-only-thing-in-their-wrapper-element");
    }

    // End block of code to remove with Meteor 1.1.1

    var props = _.omit(data, 'component');
    React.render(React.createElement(comp, props), container);
  });
});

Template.React.onDestroyed(function () {
  React.unmountComponentAtNode(this.container);
});

// Gets the name of the template inside of which this instance of `{{>
// React ...}}` is being used. Used to print more explicit error messages
function parentTemplateName () {
  var view = Blaze.getView();
  if (!view || view.name !== "Template.React")
    throw new Error("Unexpected: called outside of Template.React");

  // find the first parent view which is a template or body
  view = view.parentView;
  while (view) {
    var m;
    // check `view.name.match(/^Template\./)` because iron-router (and
    // maybe other packages) create a view named "yield" that has the
    // `template` property set
    if (view.template && view.name && (m = view.name.match(/^Template\.(.*)/))) {
      return m[1];
    } else if (view.name === "body") {
      return "<body>";
    }

    view = view.parentView;
  }

  // not sure when this could happen
  return "<unknown>";
};

// Gets the number of child nodes of `el` that aren't only whitespace
function numChildNodes (el) {
  var numChildNodes = 0;
  for (var node = el.firstChild; node; node = node.nextSibling) {
    if (!((node.nodeType === 3 /*Node.TEXT_NODE (which isn't in old IE)*/
           || node.nodeType === 8) /*Node.COMMENT_NODE; Blaze uses in old IE*/
          && node.nodeValue.match(/^\s*$/))) {
      numChildNodes++;
    }
  }

  return numChildNodes;
};
