var fs = require('fs');
var conf = require('../config.json');
var path = require('path');

//var dust = require('dustjs-linkedin');

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
    res.render('issues', { name: req.params.filename,
        allDocs: hugeArray
    });

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

//    var tmplName = "issues";
//    var tmplString = fs.readFileSync("views/"+tmplName+".dust").toString(); //this is usually no problem since the template is quite short...
//
//    var count=0;
//
//    var compiled = dust.compile(tmplString, tmplName); //template string, tmpl name to be set in loadSource
//    dust.loadSource(compiled); //caching and setting name
//    res.writeHead(200, {'Content-Type': 'text/html'});
//    dust.stream(tmplName, { name: req.params.filename,
//        allDocs: hugeArray
//    })//tmpl name, context
//        .on('data', function (chunk) {
//            if (chunk) {
//                //console.log('#');
//                count++;
//                if(count%1000==0)console.log(count);
//                res.write(chunk,'utf8');  //this is a node function!! (also end etc...)
//            }
//        })
//        .on('end', function () {
//            res.end();
//        })
//        .on('error', function (err) {
//            res.write("ERRORORORORORORORO " + err);
//            res.end();
//        });

};