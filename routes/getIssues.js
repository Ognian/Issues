/**
 * Created by ogi on 30.11.13.
 */

var conf = require('../config.json');
var fs = require('fs');
var ghi = require('../GithubIssues.js');


/*
 * GET home page.
 */

exports.getIssues = function(req, res){
    res.render('getIssues', {});
};

exports.getIssuesDo = function(req, res){
    //console.log("getIssuesDo %s %s %s %s %s",req.body.usr, req.body.pass, req.body.repoUsr, req.body.repo, conf.path);
    ghi.getAllGHIssues(req.body.usr, req.body.pass, req.body.repoUsr, req.body.repo, conf.path);
res.redirect("/");
};