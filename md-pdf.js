(function(expose) {
  var defaultFontSize = 12;
  var defaultFont = 'Helvetica';

  var handlers = {};

  var isString = function(object) {
    return typeof object === 'string'
  };

  var renderChildren = function(doc, children, options) {
    var opts = options || {
        continued: true
      };

    for (var i in children) {
      var child = children[i];
      if (isString(child))
        doc.text(child, opts);
      else
        (handlers[child[0]] || handlers.markdown).call(doc, child.slice(1));
    }
  };

  var renderBlock = function(doc, children) {
    doc.text('');
    renderChildren(doc, children);
    doc.moveDown().moveDown();
  };

  handlers.markdown = function(children) {
    this.font(defaultFont).fontSize(defaultFontSize);
    renderChildren(this, children);
  };

  //Inline
  handlers.link = function(children) {
    this.font(defaultFont);
    var attr = children[0];
    renderChildren(this, children.slice(1), {
      continued: true,
      link: attr.href,
      underline: true,
      fill: 'blue'
    });
  };

  handlers.em = function(children) {
    this.font(defaultFont + '-Oblique');
    renderChildren(this, children);
    this.font(defaultFont);
  };

  handlers.strong = function(children) {
    this.font(defaultFont + '-Bold');
    renderChildren(this, children);
    this.font(defaultFont);
  };

  //Block
  handlers.header = function(children) {
    var attr = children[0];
    this.font(defaultFont).fontSize(defaultFontSize * (6 - attr.level * 1.3));
    renderBlock(this, children.slice(1));
  };

  handlers.code_block = function(children) {
    this.font(defaultFont).fontSize(defaultFontSize);
    renderBlock(this, children);
  };

  handlers.para = function(children) {
    this.font(defaultFont).fontSize(defaultFontSize);
    renderBlock(this, children);
  };

  handlers.bulletlist = function(children) {
    this.font(defaultFont).fontSize(defaultFontSize);
    renderBlock(this, children);
  };

  handlers.listitem = function(children) {
    this.font(defaultFont).text('').moveDown().text("* ", {
      continued: true
    });
    renderChildren(this, children);
  }

  handlers.table = function(thildren) {}

  expose.mdPdf = function(text) {
    var jsonMlTemplate = markdown.parse(text, 'Maruku');

    var doc = new PDFDocument();
    var stream = doc.pipe(blobStream());

    handlers[jsonMlTemplate[0]].call(doc, jsonMlTemplate.slice(1));

    doc.end();
    return stream;
  };

  if (typeof define === "function" && define.amd) {
    define("md-pdf", [], function() {
      return expose.mdPdf;
    });
  }

})((function() {
  if (typeof exports === "undefined") {
    return window;
  } else
    return exports;
})());
