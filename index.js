var Handlebars        = require("handlebars");
var juice             = require("juice");
var path              = require("path");
var _                 = require("lodash");
var fs                = require("fs");
var chain             = require("slide").chain;
var handlebarLayouts  = require("handlebars-layouts");

function HtmlTemplater(conf) {
  if(!(this instanceof HtmlTemplater)) {
    return new HtmlTemplater(conf);
  }
  if(!(conf.template || conf.templateFile)) {
    throw new Error("Must specify either `template` or `templateFile` to HtmlTemplater");
  }
  this.__conf                 = _.pick(conf, "css", "template", "layout");
  this.__assetsToLoad         = _.pick(conf, "cssFile", "templateFile", "layoutFile");
  this.__shouldRegisterLayout = (this.__conf.layout || this.__assetsToLoad.layoutFile) ? true : false;
  this.__juiceOptions = conf.juice || {};
}

HtmlTemplater.prototype.render = function(templateVars, cb) {
  if(!cb) {
    cb = templateVars;
    templateVars = {};
  }
  chain([
    this.__assetsToLoad && [this._loadAssets.bind(this)],
    this.__shouldRegisterLayout && [this._registerLayout.bind(this)],
    [this._render.bind(this), templateVars]
  ], function(err, result) {
    if(err) {
      return cb(err);
    }
    cb(null, result.shift());
  });
};

/*
 * Takes the *Files options and appends their
 * contents to their respective options.
 *
 * There's a harmless race condition that could
 * cause the assets to load more than once. The
 * alternative would be to use fs.readFileSync
 * or a bit more complicated 'locking' code to
 * ensure mutual exclusion.
 *
*/
HtmlTemplater.prototype._loadAssets = function(cb) {
  var files = this.__assetsToLoad;
  var me = this;
  var loadAsset = this._loadAsset.bind(this)
  chain([
    files.layoutFile && [loadAsset, "layout", files.layoutFile],
    files.templateFile && [loadAsset, "template", files.templateFile],
    files.cssFile && [loadAsset, "css", files.cssFile]
  ], function(err, results) {
    if(err) {
      return cb(err);
    }
    /* Merge results together and append to original options */
    results = _.extend.apply(null, results);
    _.forEach(results, function(v, k) { me.__conf[k] = (me.__conf[k] || "") + v });
    me.__assetsToLoad = null;
    cb();
  });
};

HtmlTemplater.prototype._registerLayout = function(cb) {
  var layoutName;
  handlebarLayouts.register(Handlebars);
  Handlebars.registerHelper("extend", function(name) {
    layoutName = name;
  });
  Handlebars.compile(this.__conf.template)();
  if(!layoutName) {
    return cb(new Error("Could not detect automatically detect the layout name"));
  }
  Handlebars.registerPartial(layoutName, this.__conf.layout);
  handlebarLayouts.register(Handlebars); //reattach original extend helper.
  this.__shouldRegisterLayout = false
  cb();
};

HtmlTemplater.prototype._render = function(templateVars, cb) {
  if(!this.__memoizedTemplate) {
    this.__memoizedTemplate = Handlebars.compile(this.__conf.template);
  }
  var renderedTemplate = this.__memoizedTemplate(templateVars);
  var juiceOptions = _.extend({
    extraCss: this.__conf.css,
    applyStyleTags: false,
    removeStyleTags: false
  }, this.__juiceOptions);
  juice.juiceResources(renderedTemplate, juiceOptions, function(err, inlinedTemplate) {
    if (err != null) {
      return cb(err);
    }
    cb(null, inlinedTemplate);
  });
};

HtmlTemplater.prototype._loadAsset = function(asset, path, cb) {
  fs.readFile(path, {encoding: "utf8"}, function(err, content) {
    if(err) {
      return cb(err);
    }
    var result = {};
    result[asset] = content;
    cb(null, result);
  });
};

module.exports = HtmlTemplater;
