/**
 *  generate an index.html file with links to all the examples in the examples folder.
 *  To run, go to the main directory and run "node gh-page/generator.js"
 */

var fs = require('fs');
var path = require('path');

// array of example names
var exampleNames = getDirectories('./examples');

// output --> index.html
var fileName = 'index.html';

var stream = fs.createWriteStream(fileName);

stream.once('open', function(fd) {
  var html = buildHtml(exampleNames);

  stream.end(html);
});


function buildHtml(examples) {
  var header = '<link rel="stylesheet" type="text/css" href="./gh-page/main.css">';
  var body = '<div id="container">\n'
  + '<div id="lockup">\n <a href="http://p5js.org/">\n'
  + '<div id="p5_logo">'
  + '<img type="image/svg+xml" src="http://p5js.org/img/p5js-beta.svg" id="logo_image" class="logo" />'
  + '</div></a></div>\n'
  + '<div class="column-span"> \n'
  + '<h2>p5.sound\n'
  + ' ~ <a href="http://p5js.org/reference/#/libraries/p5.sound">Documentation</a>\n'
  + ' ~ <a href="http://github.com/processing/p5.js-sound">Source</a></h2>'
  + '<h3>Examples:</h3>';

  examples.forEach(function(example) {
    if (example[0] != '_') {
      body += '<div><a href="examples/' + example + '">' + example + '</a></div>\n'
    };
  });

  body += '</div></div> \n';

  // concatenate header string
  // concatenate body string

  return '<!DOCTYPE html>'
       + '<html><header>' + header + '</header><body id="homepage">' + body + '</body></html>';
};


/** helpers **/

// ia http://stackoverflow.com/a/24594123/2994108
function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function(file) {
		return fs.statSync(path.join(srcpath, file)).isDirectory();
	});
}