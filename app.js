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
var getIssues = require('./routes/getIssues');
var http = require('http');
var path = require('path');

var dust_h = require('dustjs-helpers'); //this is needed!! there is a try load in consolidate...
var dust = require('dustjs-linkedin');
// dust.helpers = require('dustjs-helpers').helpers; //HACK
// DO NOT UPGRADE DUST UNTIL  issue  https://github.com/linkedin/dustjs-helpers/issues/72 is resolved and consolidate is changed..
// could be that consolidate will NEVER be updated since we ahve a new express version just leave it that way for now!!!!

dust.isDebug = true;
//dust.debugLevel = 'DEBUG';

var dateFormat = require('dateformat');

// add my format helper usage: <p>Today: {@formatDate value="{today}" format="dddd, mmmm dS, yyyy, h:MM:ss TT" /}</p>
dust.helpers.formatDate = function (chunk, context, bodies, params) {
    var value = dust.helpers.tap(params.value, chunk, context),
        format = dust.helpers.tap(params.format, chunk, context),
        timestamp;
    timestamp = new Date(value); // this converts correctly from UTC to the local timezone...
    //console.log("value: "+value+" timestamp: "+timestamp);
    return chunk.write(dateFormat(timestamp, format));
};


var marked = require('marked');
var renderer = new marked.Renderer();

var markedHeaderStartingLevel=3;

renderer.heading = function (text, level) {
    var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

    var newLevel=level+markedHeaderStartingLevel;
    return '<h' + newLevel + '><a name="' +
        escapedText +
        '" class="anchor" href="#' +
        escapedText +
        '"><span class="header-link"></span></a>' +
        text + '</h' + newLevel + '>';
};

// we could also do syntax highlighting see https://github.com/chjj/marked
marked.setOptions({
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false ,
    renderer: renderer
});

var ent = require('ent');

dust.helpers.marked = function (chunk, context, bodies, params) {
    if (bodies.block) {
        return chunk.capture(bodies.block, context, function (string, t_chunk) {   //TODO check why we have here a chunk.capture
            var str;
            try {
                var theString =ent.decode(string)
                //console.log ("the marked string to decode: %s",theString);
                str = marked(theString);

                t_chunk.end("<span class='marked'>"+str+"</span>");

            } catch (err) {
                str = "MARKED ERROR START: " + err + " MARKED ERROR END."
                console.log(str);
                t_chunk.end(str);
            }
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

//app.use(express.compress()); //not a good idea; not chunked...

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
app.get('/getIssues', getIssues.getIssues);
app.post('/getIssues', getIssues.getIssuesDo);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
