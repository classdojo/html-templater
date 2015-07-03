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
 * Html templater allows you to specify a template, along with optional layout and css strings,
 * and produces an html page with inlined css. The templater uses handlebar-layouts to
 * support this layout templating. The layout, if present, is automatically registered to
 * the template uses in the {{extend}} block (In this case: "layout").
*/

var htmlTemplater = HtmlTemplater({
	css: '.div{margin: 10px}',
	layout: '<html><header> {{#block: "body"}}{{/block}}</header></html>',
	template: '{{/extend "layout"}} {{content "body"}} hello world {{/content}} {{/extend}}'
})
htmlTemplater.render(function(err, renderedHtml) {
  console.log(renderedHtml);
});


/*
 * You can also register file assets for htmlTemplater to load. If both the file and
 * non file option exist, the file is simply loaded and appended to whatever string
 * is supplied in the non file option.
*/


var htmlTemplater = HtmlTemplater({
  css: '.div{margin: 10px}',
  cssFile: './test/style.css',
  layoutFile: './test/layout.hbs',
  templateFile: './test/template.hbs'
})


htmlTemplater.render(function(err, renderedHtml) {
  // the applied `css` will be '.div{margin: 10px} .testclass{margin: 10px}'
  console.log(renderedHtml);
});
```


