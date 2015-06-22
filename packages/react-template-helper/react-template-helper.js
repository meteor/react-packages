Template.React.onRendered(function () {
  var parentTemplate = parentTemplateName();
  var container = this.firstNode.parentNode;
  this.container = container;

  this.autorun(function (c) {
    var data = Blaze.getData();

    var comp = data && data.component;
    if (! comp) {
      throw new Error(
        "In template " + parentTemplate + ", call to `{{> React ... }}` missing " +
          "`component` argument.");
    }

    // Remove this block of code once we ship Meteor 1.1.1 or above,
    // where we detect these cases (and more) when templates are
    // compiled:
    // https://github.com/meteor/meteor/commit/29d907e8365fa28b22994cb63311de60fd58cc1f
    //
    // (We no longer test the code below since the templates needed to
    // test it won't compile on devel)

    // expected nodes that aren't whitespace-only text nodes
    var expectedContainerChildNodes = c.firstRun ? 0 : 1;
    if (numChildNodes(container) > expectedContainerChildNodes) {
      var compDescriptor = comp.displayName
            ? "the React component " + comp.displayName
            : "a React component";

      throw new Error(
        "Template " + parentTemplate + " must render " + compDescriptor +
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
  if (view.name !== "Template.React")
    throw new Error("Unexpected: called outside of Template.React");

  view = view.parentView;
  while (! view.template)
    view = view.parentView;

  var match = view.name.match(/Template\.(.*)/);
  if (! match)
    throw new Error("Unexpected: View doesn't correspond to a template? " + view.name);

  return match[1];
};

// Gets the number of child nodes of `el` that aren't only whitespace
function numChildNodes (el) {
  var numChildNodes = 0;
  for (var node = el.firstChild; node; node = node.nextSibling) {
    if (!(node.nodeType === Node.TEXT_NODE && node.nodeValue.match(/^\s*$/))) {
      numChildNodes++;
    }
  }

  return numChildNodes;
};

