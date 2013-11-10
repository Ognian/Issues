/**
 * (c) 2013 OGI-IT.
 * User: ogi
 * Date: 28.10.13
 * Time: 13:32
 */
"use strict";

var GitHubApi = require("github");
var fs = require('fs');
var path = require('path');

var stdio = require('stdio');

var options = stdio.getopt({
    'authUser': {key: 'a', description: 'authenticate as user with password (eg. -a user1 pwd1)', mandatory: true, args: 2},
    'repo': {key: 'r', description: 'repository in the form username repository name (eg. -a user1 repo2)', mandatory: true, args: 2},
    'outputPath': {key: 'o', description: 'output Path (default ./data)', args: 1}
});

if (!options.outputPath) {
    options.outputPath = "./data";
};
if(!fs.existsSync(options.outputPath)){
    fs.mkdirSync(options.outputPath);
};

//console.log(JSON.stringify(options, undefined, 2));

var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    //debug: true, // very helpful
    protocol: "https",
    //host: "github.my-GHE-enabled-company.com",
    timeout: 5000
});

github.authenticate({
    type: "basic",
    username: options.authUser[0],
    password: options.authUser[1]
});

var issuesUser = options.repo[0];
var issuesRepo = options.repo[1];

// see http://mikedeboer.github.io/node-github/#issues.prototype.getAll issues
// and
// http://developer.github.com/v3/issues/#list-issues-for-a-repository

function getGHIssues(usr, rep, type, filename) {
    github.issues.repoIssues(
        {
            repo: rep,
            user: usr,
            state: type,
//        labels: "",
//        sort: "updated",
//        direction: "asc"
            per_page: 100 //change to 1 for testing paging
        },
        function (err, res) {
            //res is an array containing the issues but also has a meta field...

            if (err) {
                console.log("ERROR " + err)
                return;
            }

            function doWithIssues(issueArray) {
                for (var i = 0; i < issueArray.length; i++) {
                    //console.log("an issue:" + JSON.stringify(issueArray[i], undefined, 2));

                    //get comments
                    github.issues.getComments(
                        {
                            repo: rep,
                            user: usr,
                            number: issueArray[i].number,
                            per_page: 100 //change to 1 for testing paging
                        },
                        function (allComments, iA, err, res) {
                            //res is an array containing the issues but also has a meta field...
                            if (err) {
                                console.log("ERROR " + err)
                                return;
                            }

                            function doWithComments(commentArray) {
                                //console.log("a comment:" + JSON.stringify(commentArray, undefined, 2));
                                for (var j = 0; j < commentArray.length; j++) {
                                    allComments.push(commentArray[j]);
                                }
                            }

                            function getMoreC(r, iA1) {
                                if (github.hasNextPage(r)) {
                                    github.getNextPage(r, function (err, res) {
                                        if (err) {
                                            console.log("ERROR " + err)
                                            return;
                                        }
                                        doWithComments(res);
                                        getMoreC(res, iA1);
                                    });
                                } else {
                                    //finished dump it
                                    //console.log("FINISHED do dump!");
                                    // add collected comments
                                    iA1.ogi_allComments = allComments;

                                    var fd = fs.openSync(filename, "a");
                                    // we use the mongodb format: one json object per line with no "," !!
                                    // as an array it would be limited...
                                    fs.writeSync(fd, JSON.stringify(iA) + "\n");
                                    fs.closeSync(fd);

                                }

                            }

                            doWithComments(res);
                            getMoreC(res, iA); //if there are a lot of pages recursion may get quite deep


                        }.bind(null, [], issueArray[i]) // issueArray[i] will be passed before "defined" arguments ...

                    );

                }
            }

            function getMore(r) {
                if (github.hasNextPage(r)) {
                    github.getNextPage(r, function (err, res) {
                        if (err) {
                            console.log("ERROR " + err)
                            return;
                        }
                        doWithIssues(res);
                        getMore(res);
                    });
                }

            }

            doWithIssues(res);
            getMore(res); //if there are a lot of pages recursion may get quite deep

        }
    );
}


var filename = "Issues_" + issuesUser + "_" + issuesRepo + "_" + new Date().toISOString().
    replace(/T/, '_').      // replace T with a underscore
    replace(/\..+/, '').     // delete the dot and everything after;
    replace(/:/g, '_')      // replace : with an underscore g-> all
    + ".json";
filename=path.join(options.outputPath, filename );

// time is UTC !! that is good!

var fd = fs.openSync(filename, "w");
fs.closeSync(fd);
getGHIssues(issuesUser, issuesRepo, "open", filename);
getGHIssues(issuesUser, issuesRepo, "closed", filename);


// issues and comments are linked together:
// comments point to issue url via issue_url
// comment: issue_url
// issue: url
// but we don't need this since we retrieve them now together