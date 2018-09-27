var HtmlTemplater = require("./");
var expect = require("expect.js");
var sinon = require("sinon");
var _ = require("lodash");
var async = require("async");

describe("HtmlTemplater", () => {
  var htmlTemplater;
  var fullConf = {
    template: "template",
    css: "css",
    layout: "layout",
    templateFile: "./test/template.hbs",
    cssFile: "./test/style.css",
    layoutFile: "./test/layout.hbs",
  };

  var conf = _.pick.bind(_, fullConf, "template", "css", "layout");
  var fileConf = _.pick.bind(_, fullConf, "templateFile", "cssFile", "layoutFile");

  describe("constructor", () => {
    it("allows instantiation via invocation", () => {
      htmlTemplater = HtmlTemplater(conf());
      expect(htmlTemplater).to.be.an(HtmlTemplater);
    });

    it("requires a template or templateFile", () => {
      expect(HtmlTemplater.bind(HtmlTemplater, {})).to.throwException();
      expect(HtmlTemplater.bind(HtmlTemplater, _.pick(conf(), "template"))).to.not.throwException();
      expect(HtmlTemplater.bind(HtmlTemplater, _.pick(fileConf(), "templateFile"))).to.not.throwException();
    });

    it("separates css and file options", () => {
      htmlTemplater = HtmlTemplater(fullConf);
      expect(htmlTemplater.__conf).to.eql(conf());
      expect(htmlTemplater.__assetsToLoad).to.eql(fileConf());
    });

    it("sets shouldRegisterLayout=true when layout or layoutFile options are present", () => {
      htmlTemplater = HtmlTemplater(_.pick(conf(), "template", "layout"));
      expect(htmlTemplater.__shouldRegisterLayout).to.be(true);
      htmlTemplater = HtmlTemplater(_.pick(fullConf, "template", "layoutFile"));
      expect(htmlTemplater.__shouldRegisterLayout).to.be(true);
    });

    it("sets shouldRegisterLayout=false when there are no layout options present", () => {
      expect(HtmlTemplater(_.pick(conf(), "template")).__shouldRegisterLayout).to.be(false);
    });
  });

  describe("#render", () => {
    var loadAssetsStub, registerLayoutStub, renderStub;

    before(() => {
      htmlTemplater = HtmlTemplater(fullConf);
      loadAssetsStub = sinon.stub(htmlTemplater, "_loadAssets").yields(null);
      registerLayoutStub = sinon.stub(htmlTemplater, "_registerLayout").yields(null);
      renderStub = sinon.stub(htmlTemplater, "_render").yields(null);
    });

    it("loads assets, registers layout, and renders template", (done) => {
      var templateVars = {};
      htmlTemplater.render(templateVars, (err) => {
        expect(!!err).to.be(false);
        expect(loadAssetsStub.callCount).to.be(1);
        expect(registerLayoutStub.callCount).to.be(1);
        expect(renderStub.callCount).to.be(1);
        done();
      });
    });
  });

  describe("#_loadAssets", () => {
    var loadAssetStub;
    var firstTwoArgs = function(call) {
      return call.args.slice(0, 2);
    };

    beforeEach(() => {
      htmlTemplater = HtmlTemplater(fileConf());
      loadAssetStub = sinon.stub(htmlTemplater, "_loadAsset");
    });

    it("loads layout, template, and css files", (done) => {
      loadAssetStub.yields(null);
      htmlTemplater._loadAssets((err) => {
        expect(!!err).to.be(false);
        expect(loadAssetStub.callCount).to.be(3);
        expect(firstTwoArgs(loadAssetStub.firstCall)).to.eql(["layout", fileConf().layoutFile]);
        expect(firstTwoArgs(loadAssetStub.secondCall)).to.eql(["template", fileConf().templateFile]);
        expect(firstTwoArgs(loadAssetStub.thirdCall)).to.eql(["css", fileConf().cssFile]);
        done();
      });
    });

    it("combines the results when multiple files are present", (done) => {
      loadAssetStub.onFirstCall().yields(null, { layout: conf().layout });
      loadAssetStub.onSecondCall().yields(null, { template: conf().template });
      loadAssetStub.onThirdCall().yields(null, { css: conf().css });
      htmlTemplater._loadAssets((err) => {
        expect(!!err).to.be(false);
        expect(htmlTemplater.__conf).to.eql(conf());
        done();
      });
    });
  });

  describe("#_loadAssets called in parallel", () => {
    var loadAssetStub;

    beforeEach(() => {
      htmlTemplater = HtmlTemplater(fileConf());
      loadAssetStub = sinon.stub(htmlTemplater, "_loadAsset", (asset, path, cb) => {
        setTimeout(() => {
          var ret = {};
          ret[asset] = conf()[asset];
          cb(null, ret);
        }, 50);
      });
    });

    afterEach(() => loadAssetStub.restore());

    it("only append the contents once", (done) => {
      async.times(
        10,
        (n, next) => {
          htmlTemplater._loadAssets(next);
        },
        (err) => {
          expect(!!err).to.be(false);
          expect(htmlTemplater.__conf).to.eql(conf());
          done();
        },
      );
    });
  });

  describe("#_registerLayout", () => {
    it("detects the name of the layout used by the template");

    it("errors if the template does not use a layout");

    it("register the layout with handlebars");
  });

  describe("#_render", () => {
    it("templates variables and inlines css");
  });

  describe("integration test", () => {
    var expectedOutput =
      '<html>\n\t<header>Header</header>\n\t\t<div class="testclass" style="margin: 10px;"> hello world test </div>\n\t<footer>Footer</footer>\n</html>\n';

    it("templates properly with a provided layout", (done) => {
      htmlTemplater = HtmlTemplater(fileConf());
      htmlTemplater.render({ testVar: "hello world" }, (err, renderedHtml) => {
        expect(!!err).to.be(false);
        expect(renderedHtml).to.be(expectedOutput);
        done();
      });
    });

    it("uses css provided in `css` when *files are specified", (done) => {
      htmlTemplater = HtmlTemplater(_.extend(_.omit(fileConf(), "cssFile"), { css: ".testclass{margin: 10px}" }));
      htmlTemplater.render({ testVar: "hello world" }, (err, renderedHtml) => {
        expect(!!err).to.be(false);
        expect(renderedHtml).to.be(expectedOutput);
        done();
      });
    });
  });

  describe("integration test with helpers", () => {
    var expectedOutput =
      '<html>\n\t<header>Header</header>\n\t\t<div class="testclass" style="margin: 10px;"> helped test </div>\n\t<footer>Footer</footer>\n</html>\n';

    it("templates properly with a provided layout", (done) => {
      htmlTemplater = HtmlTemplater(_.set(fileConf(), "templateFile", "./test/templateWithHelper.hbs"));
      htmlTemplater.registerHelper({
        testHelper() {
          return "helped";
        },
      });
      htmlTemplater.render({ testVar: "value that will be replaced to be helper" }, (err, renderedHtml) => {
        expect(!!err).to.be(false);
        expect(renderedHtml).to.be(expectedOutput);
        done();
      });
    });
  });
});
