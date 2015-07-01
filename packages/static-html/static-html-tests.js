// Simulate the old API with results so the tests work
function scanHtmlWrapper(contents) {
  var results = {
    body: '',
    head: '',
    js: ''
  };

  var addHtml = function (opts) {
    results[opts.section] += opts.data;
  }

  scanHtmlForTest(contents, '', addHtml);

  return results;
}

Tinytest.add("templating - html scanner", function (test) {
  var testInString = function(actualStr, wantedContents) {
    if (actualStr.indexOf(wantedContents) >= 0)
      test.ok();
    else
      test.fail("Expected "+JSON.stringify(wantedContents)+
                " in "+JSON.stringify(actualStr));
  };

  var checkError = function(f, msgText, lineNum) {
    try {
      f();
    } catch (e) {
      if (e.line === lineNum)
        test.ok();
      else
        test.fail("Error should have been on line " + lineNum + ", not " +
                  e.line);
      testInString(e.message, msgText);
      return;
    }
    test.fail("Parse error didn't throw exception");
  };

  // returns the appropriate code to put content in the body,
  // where content is something simple like the string "Hello"
  // (passed in as a source string including the quotes).
  var simpleBody = function (content) {
    return content;
  };

  // arguments are quoted strings like '"hello"'
  var simpleTemplate = function (templateName, content) {
    // '"hello"' into '"Template.hello"'
    var viewName = templateName.slice(0, 1) + 'Template.' + templateName.slice(1);

    return '\nTemplate.__checkName(' + templateName + ');\nTemplate[' + templateName +
      '] = new Template(' + viewName +
      ', (function() {\n  var view = this;\n  return ' + content + ';\n}));\n';
  };

  var checkResults = function(results, expectBody, expectHead) {
    test.equal(results.js, '');
    test.equal(results.body, expectBody || '');
    test.equal(results.head, expectHead || '');
  };

  checkError(function() {
    return scanHtmlWrapper("asdf");
  }, "Expected <head> or <body> tag in HTML file", 1);

  // body all on one line
  checkResults(
    scanHtmlWrapper("<body>Hello</body>"),
    simpleBody('Hello'));

  // multi-line body, contents trimmed
  checkResults(
    scanHtmlWrapper("\n\n\n<body>\n\nHello\n\n</body>\n\n\n"),
    simpleBody('Hello'));

  // same as previous, but with various HTML comments
  checkResults(
    scanHtmlWrapper("\n<!--\n\nfoo\n-->\n<!-- -->\n"+
                      "<body>\n\nHello\n\n</body>\n\n<!----\n>\n\n"),
    simpleBody('Hello'));

  // head and body
  checkResults(
    scanHtmlWrapper("<head>\n<title>Hello</title>\n</head>\n\n<body>World</body>\n\n"),
    simpleBody('World'),
    "<title>Hello</title>");

  // head and body with tag whitespace
  checkResults(
    scanHtmlWrapper("<head\n>\n<title>Hello</title>\n</head  >\n\n<body>World</body\n\n>\n\n"),
    simpleBody('World'),
    "<title>Hello</title>");

  checkError(function () {
    scanHtmlWrapper('<body foo="bar">\n  Hello\n</body>')
  }, "Attributes on <head> and <body> not supported. Add them at runtime with JavaScript.", 1);

  // error cases; exact line numbers are not critical, these just reflect
  // the current implementation

  // unclosed body (error mentions body)
  checkError(function() {
    return scanHtmlWrapper("\n\n<body>\n  Hello\n</body");
  }, "body", 3);

  // bad open tag
  checkError(function() {
    return scanHtmlWrapper("\n\n\n<bodyd>\n  Hello\n</body>");
  }, "Expected <head> or <body> tag in HTML file", 4);
  checkError(function() {
    return scanHtmlWrapper("\n\n\n\n<body foo=>\n  Hello\n</body>");
  }, "error in tag", 5);

  // unclosed tag
  checkError(function() {
    return scanHtmlWrapper("\n<body>Hello");
  }, "nclosed", 2);

  // helpful doctype message
  checkError(function() {
    return scanHtmlWrapper(
      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" '+
        '"http://www.w3.org/TR/html4/strict.dtd">'+
        '\n\n<head>\n</head>');
  }, "DOCTYPE", 1);

  // lowercase basic doctype
  checkError(function() {
    return scanHtmlWrapper(
      '<!doctype html>');
  }, "DOCTYPE", 1);

  // attributes on head not supported
  checkError(function() {
    return scanHtmlWrapper('<head foo="bar">\n  Hello\n</head>');
  }, "<head>", 1);

  // can't mismatch quotes
  checkError(function() {
    return scanHtmlWrapper('<template name="foo\'>'+
                             'pizza</template>');
  }, "error in tag", 1);

  // unexpected <html> at top level
  checkError(function() {
    return scanHtmlWrapper('\n<html>\n</html>');
  }, "Expected <head> or <body> tag in HTML file", 2);

});