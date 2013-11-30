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

    return chunk.write(date + '.' + month + '.' + year); //TODO why do we have here write and not end ?????
};


var marked = require('marked');
marked.setOptions({
    gfm: true,
//    highlight: function (code, lang, callback) {
//        pygmentize({ lang: lang, format: 'html' }, code, function (err, result) {
//            if (err) return callback(err);
//            callback(null, result.toString());
//        });
//    },
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    langPrefix: 'lang-'
});

var ent = require('ent');

dust.helpers.marked = function (chunk, context, bodies, params) {
    if (bodies.block) {
        return chunk.capture(bodies.block, context, function (string, t_chunk) {   //TODO check why we have here a chunk.capture
            //console.log('.');

// var. 1 sync
            var str;
            try {
                //console.log("STRING");
                //console.log(string);
                //str = marked(string);
                //console.log('l');

//                // Let marked do its normal token generation.
//                tokens = marked.lexer( content );
//
//// Mark all code blocks as already being escaped.
//// This prevents the parser from encoding anything inside code blocks
//                tokens.forEach(function( token ) {
//                    if ( token.type === "code" ) {
//                        token.escaped = true;
//                    }
//                });
//
//// Let marked do its normal parsing, but without encoding the code blocks
//                parsed = marked.parser( tokens );
//



                var tokens=marked.Lexer.lex(ent.decode(string), marked.options); //ew have to html decode string !!!
                //console.log('p');
                tokens.forEach(function( token ) {
                    if ( token.type === "code" ) {
                        token.escaped = true;
                    }

                });

                //console.log("TOK->"+JSON.stringify(tokens)); //this works great to find failing marked parser infinite loop!!!!
                str = marked.Parser.parse(tokens, marked.options); //this one goes into an endless loop....!!!

                t_chunk.end(str);
                //console.log("STR");
                //console.log(str);

            } catch (err) {
                str = "MARKED ERROR START: " + err + " MARKED ERROR END."
                console.log(str);
                t_chunk.end(str);
            }

// var. 2 async
//                marked(string, function (err, content) {
//                    if (err) {
//                    console.log("marked async ERROR: "+err);
//                    }
////                    console.log("CONTEND");
////                    console.log(content);
//                    //jgfsdlgflas //errors here are ignored!!!! thats the problem !!!!
//                    t_chunk.end(content);
//                });


        });
    }
    return chunk;
};

var Showdown = require('showdown');
var converter = new Showdown.converter({ extensions: ['github', 'prettify', 'table'] });
dust.helpers.showdown = function (chunk, context, bodies, params) {
    if (bodies.block) {
        return chunk.capture(bodies.block, context, function (string, chunk) {
            //console.log('.');
            var str;
            try {
                //console.log("STRING");
                //console.log(string);

                str = converter.makeHtml(ent.decode(string));
                chunk.end(str);
                //console.log("STR");
                //console.log(str);
            } catch (err) {
//                console.log("STRING");
//                console.log(string);
//                console.log("STR");
//                console.log(str);

                str = "SHOWDOWN ERROR START: " + err + " SHOWDOWN ERROR END."
                console.log(str);
                chunk.end(str);
            }
        });
    }
    return chunk;
};

var Markdown = require('markdown').markdown;
dust.helpers.markdown = function (chunk, context, bodies, params) {
    if (bodies.block) {
        return chunk.capture(bodies.block, context, function (string, chunk) {
            //console.log('.');
            var str;
            try {
//                console.log("STRING");
//                console.log(string);

                str = Markdown.toHTML(ent.decode(string));
                chunk.end(str);
//                console.log("STR");
//                console.log(str);
            } catch (err) {
//                console.log("STRING");
//                console.log(string);
//                console.log("STR");
//                console.log(str);

                str = "MARKDOWN ERROR START: " + err + " MARKDOWN ERROR END."
                console.log(str);
                chunk.end(str);
            }
        });
    }
    return chunk;
};

var Ghm = require('ghm');
dust.helpers.ghm = function (chunk, context, bodies, params) {
    if (bodies.block) {
        return chunk.capture(bodies.block, context, function (string, chunk) {
            //console.log('.');
            var str;
            try {
//                console.log("STRING");
//                console.log(string);

                str = Ghm.parse(ent.decode(string));
                chunk.end(str);
//                console.log("STR");
//                console.log(str);
            } catch (err) {
//                console.log("STRING");
//                console.log(string);
//                console.log("STR");
//                console.log(str);

                str = "GHM ERROR START: " + err + " GHM ERROR END."
                console.log(str);
                chunk.end(str);
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

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});