var path = require('path');
var fs = require('fs');
var jsHtml = require('../lib/jshtml');
var tools = require('../lib/tools');

function runDirectory(dirPath, options)	{
	var extendOptionsJson = '{}';
	try	{
		extendOptionsJson = fs.readFileSync(dirPath + '.json', 'utf-8');
	}
	catch(ex)	{
	}
	var extendOptions = JSON.parse(extendOptionsJson);
	var options = tools.extend({}, options, extendOptions);
	
	fs.readdirSync(dirPath).forEach(function(subPath) {
		var filePath = dirPath + '/' + subPath;
		var fileStat = fs.statSync(filePath);
		if(fileStat.isDirectory()) runDirectory(filePath, options);
		if(fileStat.isFile()) runFile(filePath, options);
	});
}

function runFile(filePath, options)	{
	var match = /((.*\/)?(.+))\.jshtml$/i.exec(filePath);
	if (!match) return;

	console.log('[' + match[3] + ']');


	var extendOptionsJson = '{}';
	try	{
		extendOptionsJson = fs.readFileSync(match[1] + '.json', 'utf-8');
	}
	catch(ex)	{
	}
	var extendOptions = JSON.parse(extendOptionsJson);
	var options = tools.extend({}, options, extendOptions);


	function write() {}
	function end() {}

	var fn = require(match[1]);
	fn.call(options.scope, write, end, options.locals);	
}

runDirectory(path.normalize(__dirname + '/../examples/views/simple'), {
	locals:	{
		body: ''
		, partial: function(){}
	}
});

