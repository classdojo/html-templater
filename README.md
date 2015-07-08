# html-templater

A small wrapper around juice and handlebars that renders and inlines css for html templates.

## Tests
```bash
make test
```


## Usage
```js
var HtmlTemplater = require("html-templater");

/*
 * Html templater allows you to specify a template, along with optional layout 
 * and css strings, and produces an html page with inlined css. The templater 
 * uses handlebar-layouts to support this layout templating. The layout, if 
 * present, is automatically registered to whatever the template specifies 
 * in the {{extend}} block (In this case: "layout").
*/

var htmlTemplater = HtmlTemplater({
	css: '.div{margin: 10px}',
	layout: '<html><header> {{#block: "body"}}{{/block}}</header></html>',
	template: '{{/extend "layout"}} {{content "body"}} {{ greeting }} world {{/content}} {{/extend}}'
})
htmlTemplater.render({greeting: "hello"}, function(err, renderedHtml) {
  console.log(renderedHtml);
});


/*
 * You can also register file assets for htmlTemplater to load. If both 
 * the file and non file option exist, the file is simply loaded and appended
 * to the string supplied in the non file option.
*/


var htmlTemplater = HtmlTemplater({
  css: '.div{margin: 10px}',
  cssFile: './test/style.css',
  layoutFile: './test/layout.hbs',
  templateFile: './test/template.hbs'
})


htmlTemplater.render({greeting: "hello"}, function(err, renderedHtml) {
  // the applied `css` will be '.div{margin: 10px} .testclass{margin: 10px}'
  console.log(renderedHtml);
});

/*
 * You can also register (and unregister) helpers to be used in rendering.
 */
var htmlTemplater = HtmlTemplater(_.set(fileConf(), "templateFile", "./test/templateWithHelper.hbs"));
htmlTemplater.registerHelper({
  "testHelper": function(context) {
    return "helped";
  }
});
// now {{testHelper testVar}} in your layouts will be rendered as "helped", per this helper function

```


