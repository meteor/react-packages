Template.React.onRendered(function () {
  var tmpl = this;
  var parentTemplate = parentTemplateName();

  this.autorun(function (c) {
    var self = this;
    var data = Blaze.getData();

    var comp = data && data.component;
    if (! comp) {
      throw new Error(
        "In template " + parentTemplate + ", call to `{{> React ... }}` missing " +
          "`component` argument.");
    }

    var container = self.firstNode().parentNode;
    var expectedContainerChildElements = c.firstRun ? 0 : 1;
    if (numChildElements(container) > expectedContainerChildElements) {
      var compDescriptor = comp.displayName
            ? "the React component " + comp.displayName
            : "a React component";

      throw new Error(
        "Template " + parentTemplate + " must render " + compDescriptor +
          " as the only child of its parent element. Learn more here: XXX");
    }

    var props = _.omit(data, 'component');
    React.render(React.createElement(comp, props), container);
  });
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

function numChildElements (el) {
  var numChildElements = 0;
  for (var node = el.firstChild; node; node = node.nextSibling) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      numChildElements++;
    }
  }

  return numChildElements;
};

