/**
 * Created by ogi on 30.11.13.
 */

var conf = require('../config.json');
//var ghi = require('../GithubIssues.js');
var writeGHIToFile = require('../getGHIssuesPromised.js');


/*
 * GET home page.
 */

exports.getIssues = function(req, res){
    res.render('getIssues', {});
};

exports.getIssuesDo = function(req, res){
    //console.log("getIssuesDo %s %s %s %s %s",req.body.usr, req.body.pass, req.body.repoUsr, req.body.repo, conf.path);
    //ghi.getAllGHIssues(req.body.usr, req.body.pass, req.body.repoUsr, req.body.repo, conf.path);

    writeGHIToFile(req.body.usr, req.body.pass, req.body.repoUsr, req.body.repo, conf.path, function (err, result) {
        if (err) {
            console.log("finshed with error %j", err)
            // For now we do not somehow display an error, just redirect to retry
            res.redirect("/getIssues");
        } else {
            console.log("finshed with result %j", result)
            res.redirect("/");        }

    });

};