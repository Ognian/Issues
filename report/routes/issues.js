var fs = require('fs');
var conf = require('../config.json');
var path = require('path');
var util = require('util');

var dust = require('dustjs-linkedin');
dust.isDebug=true;

/*
 * GET issues listing.
 */

exports.report = function (req, res) {
    var filename = path.join(conf.path, req.params.filename);

    // for now res render is pure in memory; this could be a problem; actually therefor we have chosen dust since it could be the only one templating engine supporting async reendering...
    // TODO make this async and in small chunks, that is why I ve chosen dust js!! --> not yet browsers are pretty busy when we have here 20mb or so of data resulting in 5k+ pages...
    //

    var hugeArray = [];

    fs.readFileSync(filename).toString().split('\n').forEach(function (line) {
        //console.log(line);
        if (line.length > 0) {
            hugeArray.push(JSON.parse(line));
        }
    });

    console.log("start rendering");
//    res.render('issues', { name: req.params.filename,
//        allDocs: hugeArray
//    });

    // What does render? going thrue res app -> view.render :
    // this.engine(this.path, options, fn);
    // so consolidate is actually doing this:
    //    try {
    //        var tmpl = cache(options) || cache(options, engine.compileFn(str));
    //        tmpl(options, fn);
    //    } catch (err) {
    //        fn(err);
    //    }
    //
    //  or compile template 'issues'
    //  and call it...

    var tmplName = "issues";
    var tmplString = fs.readFileSync("views/" + tmplName + ".dust").toString(); //this is usually no problem since the template is quite short...

    var count = 0;

    var compiled = dust.compile(tmplString, tmplName); //template string, tmpl name to be set in loadSource
    dust.loadSource(compiled); //caching and setting name
    //res.writeHead(200, {'Content-Type': 'text/html'}); //better without???

    //res.socket.setNoDelay();
    // to late to set it here ..... res.socket.bufferSize=102400;

    var dstr = dust.stream(tmplName, { name: req.params.filename,
        allDocs: hugeArray
    });//tmpl name, context

// var. 1 this is the simplest piping way to do it
//    dstr.pipe(res);

// var. 2 this is more complicated but I have grater control i.e. progress output...
    dstr.on('data', function (chunk) {
        if (chunk) {
//           process.nextTick(function () {
                //console.log('#');
                count++;
                if (count % 1000 == 0) {
                    console.log(count);
                    console.log(util.inspect(process.memoryUsage()));
                }
                var result = res.write(chunk);  //this is a node function!! (also end etc...)
                if (!result) {
                    //dstr.pause(); // dust stream has no pause...
                    //console.log("Problem flushing buffer to kernel: result: " + result);
                }
//            }.bind(this));
        }
    });
    dstr.on('end', function () {
        console.log('END');
        res.end();
    });
    dstr.on('error', function (err) {
        res.write("ERRORORORORORORORO " + err);
        res.end();
    });

//    res.on('drain', function() {
//        // Resume the read stream when the write stream gets hungry
//        dstr.resume();
//    });

};