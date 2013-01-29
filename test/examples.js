var path = require('path');
var fs = require('fs');
var sjs = require('sjs');
var jshtml = require('../.');
var tools = require('../lib/tools');
var assert = require('assert');

var whitespaceRegex = /\s+/g;

describe('examples', directoryTest(path.normalize(__dirname + '/../examples'), {}));


function directoryTest(rootPath, rootOptions){
	if(fs.existsSync(rootPath + '.json')){
		rootOptions = tools.extend({}, rootOptions, require(rootPath + '.json'));
	}

	return function(){
		fs.readdirSync(rootPath).forEach(function(subPath) {
			var filePath = path.join(rootPath, subPath);
			var fileStat = fs.statSync(filePath);
			var fileMatch = /^(.+)\.jshtml$/.exec(filePath);

			if(fileStat.isDirectory()) {
				describe(subPath, directoryTest(filePath, rootOptions));
			}
			if(fileStat.isFile() && fileMatch) {
				it(subPath, fileTest(fileMatch, rootOptions));
			}
		});
	}
}

function fileTest(fileMatch, fileOptions){
	if(fs.existsSync(fileMatch[1] + '.json')){
		fileOptions = tools.extend({}, fileOptions, require(fileMatch[1] + '.json'));
	}

	return function(cb){
		var actual = '';

		var src = fs.readFileSync(fileMatch[1] + '.jshtml', 'utf-8');
		src = jshtml.parse(src, fileOptions);
		src = sjs.parse(src, fileOptions);

		var fn = new Function('write', 'end', 'tools', 'locals', src);
		fn.call(fileOptions.scope, fn_write, fn_end, tools, fileOptions.locals);

		function fn_write(){
			var argumentCount = arguments.length;
			for(var argumentIndex = 0; argumentIndex < argumentCount; argumentIndex++){
				var argument = arguments[argumentIndex];
				actual += tools.str(argument);
			}
		}
		function fn_end(){
			fn_write.apply(this, arguments);

			var expect = null;
			if(fs.existsSync(fileMatch[1] + '.html')){
				expect = fs.readFileSync(fileMatch[1] + '.html', 'utf-8');
				expect = expect.replace(whitespaceRegex, '');
				actual = actual.replace(whitespaceRegex, '');
				assert.equal(actual, expect);
			}

			cb();
		}


	}
}


