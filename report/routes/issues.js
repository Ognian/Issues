var fs = require('fs');

/*
 * GET issues listing.
 */

exports.report = function (req, res) {
    //res.send("respond with a filename "+req.params.filename);
    res.render('issues', { name: req.params.filename
    });
};