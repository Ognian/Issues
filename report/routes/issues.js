var fs = require('fs');
var conf = require('../config.json');
var path = require('path');


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


    res.render('issues', { name: req.params.filename,
        allDocs: hugeArray
    });
};