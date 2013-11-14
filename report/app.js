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

var dust_h = require('dustjs-helpers'); //this is needed!! there is a try load in consolidate...
var dust = require('dustjs-linkedin');


// add my format helper usage: <p>Today: {@formatDate value="{today}"/}</p>
dust.helpers.formatDate = function (chunk, context, bodies, params) {
    var value = dust.helpers.tap(params.value, chunk, context),
        timestamp,
        month,
        date,
        year;
//TODO add a better date formating (something like )
    timestamp = new Date(value);
    month = timestamp.getMonth() + 1;
    date = timestamp.getDate();
    year = timestamp.getFullYear();

    return chunk.write(date + '.' + month + '.' + year);
};
var marked = require('marked');

dust.helpers.markdown = function(chunk, context, bodies, params) {
    if (bodies.block) {
        return chunk.capture(bodies.block, context, function(string, chunk) {
            //console.log('.');
            //try{
            chunk.end(marked(string));
            //} catch (err){console.log("marked error: "+err);}
        });
    }
    return chunk;
};

var cons = require('consolidate');


var app = express();

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));

app.engine('dust', cons.dust);
app.set('view engine', 'dust');

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
