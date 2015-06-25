function ParseError() {}

function scanHtml(contents, source_name, addHtml) {
  var rest = contents;
  var index = 0;

  var advance = function(amount) {
    rest = rest.substring(amount);
    index += amount;
  };

  var throwParseError = function (msg, overrideIndex) {
    var ret = new ParseError();
    ret.message = msg || "bad formatting in template file";
    ret.file = source_name;
    var theIndex = (typeof overrideIndex === 'number' ? overrideIndex : index);
    ret.line = contents.substring(0, theIndex).split('\n').length;
    throw ret;
  };

  var rOpenTag = /^((<(template|head|body)\b)|(<!--)|(<!DOCTYPE|{{!)|$)/i;

  while (rest) {
    // skip whitespace first (for better line numbers)
    advance(rest.match(/^\s*/)[0].length);

    var match = rOpenTag.exec(rest);
    if (! match)
      throwParseError("Expected <head> or <body> tag in HTML file");

    var matchToken = match[1];
    var matchTokenTagName =  match[3];
    var matchTokenComment = match[4];
    var matchTokenUnsupported = match[5];

    var tagStartIndex = index;
    advance(match.index + match[0].length);

    if (! matchToken) {
      break; // matched $ (end of file)
    }

    if (matchTokenComment === '<!--') {
      // top-level HTML comment
      var commentEnd = /--\s*>/.exec(rest);
      if (! commentEnd) {
        throwParseError("unclosed HTML comment in template file");
      }

      advance(commentEnd.index + commentEnd[0].length);
      continue;
    }

    if (matchTokenUnsupported) {
      if (matchTokenUnsupported.toLowerCase() === '<!doctype') {
        throwParseError(
          "Can't set DOCTYPE here; Meteor sets <!DOCTYPE html> for you");
      }

      throwParseError();
    }

    // otherwise, a <tag>
    var tagName = matchTokenTagName.toLowerCase();
    var tagAttribs = {}; // bare name -> value dict
    var rTagPart = /^\s*((([a-zA-Z0-9:_-]+)\s*=\s*(["'])(.*?)\4)|(>))/;
    var attr;

    // read attributes
    while ((attr = rTagPart.exec(rest))) {
      var attrToken = attr[1];
      var attrKey = attr[3];
      var attrValue = attr[5];
      advance(attr.index + attr[0].length);
      if (attrToken === '>') {
        break;
      }

      // XXX we don't HTML unescape the attribute value
      // (e.g. to allow "abcd&quot;efg") or protect against
      // collisions with methods of tagAttribs (e.g. for
      // a property named toString)
      attrValue = attrValue.match(/^\s*([\s\S]*?)\s*$/)[1]; // trim
      tagAttribs[attrKey] = attrValue;
    }

    if (! attr) { // didn't end on '>'
      throwParseError("Parse error in tag");
    }

    // find </tag>
    var end = (new RegExp('</'+tagName+'\\s*>', 'i')).exec(rest);

    if (! end) {
      throwParseError("unclosed <"+tagName+">");
    }

    var tagContents = rest.slice(0, end.index);
    var contentsStartIndex = index;

    if (! _.isEmpty(tagAttribs)) {
      throwParseError("Attributes on <head> and <body> not supported. " +
        "Add them at runtime with JavaScript.");
    }

    // trim the tag contents.
    // this is a courtesy and is also relied on by some unit tests.
    var m = tagContents.match(/^([ \t\r\n]*)([\s\S]*?)[ \t\r\n]*$/);
    contentsStartIndex += m[1].length;
    tagContents = m[2];

    if (tagName === "head") {
      addHtml({
        section: "head",
        data: tagContents
      });
    } else {
      addHtml({
        section: "body",
        data: tagContents
      });
    }

    // advance afterwards, so that line numbers in errors are correct
    advance(end.index + end[0].length);
  }
}

if (typeof Plugin !== "undefined") {
  Plugin.registerSourceHandler(
    "html", {isTemplate: true, archMatching: 'web'},
    function (compileStep) {
      var contents = compileStep.read().toString('utf8');
      try {
        scanHtml(contents, compileStep.inputPath,
          compileStep.addHtml.bind(compileStep));
      } catch (e) {
        if (e instanceof ParseError) {
          compileStep.error({
            message: e.message,
            sourcePath: compileStep.inputPath,
            line: e.line
          });
          return;
        } else
          throw e;
      }
    }
  );
} else {
  scanHtmlForTest = scanHtml;
}
