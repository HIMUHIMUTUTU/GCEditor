/**
 * Module dependencies.
 */

var express = require('express');
var cacheManifest = require('connect-cache-manifest');
var routes = require('./routes');
var editor = require('./routes/editor');
var doclist = require('./routes/doclist');
var download = require('./routes/download');
var analysis = require('./routes/analysis');
//var hwrecognition = require('./routes/hwrecognition');
var http = require('http');
var path = require('path');

var app = module.exports = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(express.favicon());
app.use(express.basicAuth('script', 'engine'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//cache-manifest
app.use(cacheManifest({
	manifestPath: '/application.manifest',
	files: [{
		dir: __dirname + '/public/lib',
		prefix: '/lib/',
		ignore: function(x) { return /\/\./.test(x); }
	},{
		file: __dirname + '/public/css/editor.css',
		path: '/css/editor.css'
	},{
		file: __dirname + '/public/js/editor.js',
		path: '/js/editor.js'
	},{
		file: __dirname + '/public/css/custom_content.css',
		path: '/css/custom_content.css'
	},{
		//file: __dirname + '/node_modules/socket.io/node_modules/socket.io-client/socket.io.js',
		//path: '/socket.io/socket.io.js'
	}],
		networks: ['*'],
		fallbacks: []
}));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/editor', editor.view);
app.get('/doclist', doclist.view);
app.get('/download', download.view);
app.get('/analysis', analysis.view);

server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


/* For socket-io */ 
var socketIO = require('socket.io');
var io = socketIO.listen(server);
app.set('io', io);
require('./socketio');

