/**
 * (c) 2013 OGI-IT.
 * User: ogi
 * Date: 07.11.13
 * Time: 13:32
 */
"use strict";
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var issues = require('./routes/issues');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(express.favicon()); //TODO change to custom one
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
app.disable('x-powered-by'); //get rid of the x-powerd-by = express header...

app.get('/', routes.index);
app.get('/issues/:filename', issues.report);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
