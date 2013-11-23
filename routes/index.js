
var conf = require('../config.json');
var fs = require('fs');

/*
 * GET home page.
 */

exports.index = function(req, res){
  var dir=fs.readdirSync(conf.path);
  res.render('index', { dir: conf.path,
      files:dir
  });
};