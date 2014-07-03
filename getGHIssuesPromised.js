/**
 * Created by ogi on 03.07.14.
 */


var Q = require('q');
// variant 1 would be to use q-flow but it assumes that Q is called q ...
// require('q-flow'); // extends q

// variant 2 from http://stackoverflow.com/questions/17217736/while-loop-with-promises

// `condition` is a function that returns a boolean
// `body` is a function that returns a promise
// returns a promise for the completion of the loop
function promiseWhile(condition, body) {
    var done = Q.defer();

    function loop() {
        // When the result of calling `condition` is no longer true, we are
        // done.
        if (!condition()) return done.resolve();
        // Use `when`, in case `body` does not return a promise.
        // When it completes loop again otherwise, if it fails, reject the
        // done promise
        Q.when(body(), loop, done.reject);
    }

    // Start running the loop in the next tick so that this function is
    // completely async. It would be unexpected if `body` was called
    // synchronously the first time.
    Q.nextTick(loop);

    // The promise
    return done.promise;
}


var fs = require('fs');
var path = require('path');

var GitHubApi = require("github");

var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    // debug: true, // very helpful
    protocol: "https",
    //host: "github.my-GHE-enabled-company.com",
    timeout: 5000
});

procedures = {

    writeGHIToFile: function (aUser, aPassword, aRepoUser, aRepo, aOutputPath, callback) {


        var issuesResult = [];

        function processComments(res, aResultingIssue) {
            if (!aResultingIssue.ogi_allComments) {
                aResultingIssue.ogi_allComments = []
            }
            for (var i = 0; i < res.length; i++) {
                aResultingIssue.ogi_allComments.push(res[i])
                //console.log("#%i comment %i", aResultingIssue.number, i);
            }
            return Q(); //fulfilled promise
        };


        function processIssues(res) {
            // this is just for debugging the order
            // for (var i = 0; i < res.length; i++) {
            //     console.log("--#%i", res[i].number);
            // }

            //this will preserve order !!
            var p = Q.all(res.map(function (aResultingIssue) {
                //console.log("#%i", aResultingIssue.number);

                // get Comments for the issue aResultingIssue
                issuesResult.push(aResultingIssue); //we have to push here to preserver order!!

                var githubCommentsOptions = {
                    user: aRepoUser,
                    repo: aRepo,
                    number: aResultingIssue.number,
                    per_page: 100 //change to 5 for testing paging
                };

                var p = Q.ninvoke(github.issues, "getComments", githubCommentsOptions);
                p = p.then(function (res) {
                    // res is on one side an array with .length representing the issues array
                    // but on the other side it contains a meta object for info an continuation

                    var p1 = processComments(res, aResultingIssue);
                    var theResult = res;
                    return p1.then(function () {
                        return promiseWhile(function () { //condition function
                            return github.hasNextPage(theResult)
                        }, function () { //loop function
                            return Q.ninvoke(github, "getNextPage", theResult).then(function (res) {
                                theResult = res;
                                return processComments(res, aResultingIssue);
                            });
                        });
                    });

                });

                return p;
            }));

            return p
        }


        // prepare file for writing
        if (!fs.existsSync(aOutputPath)) {
            fs.mkdirSync(aOutputPath);
        }

        var filename = "Issues_" + aRepoUser + "_" + aRepo + "_" + new Date().toISOString().
            replace(/T/, '_').      // replace T with a underscore
            replace(/\..+/, '').     // delete the dot and everything after;
            replace(/:/g, '_')      // replace : with an underscore g-> all
            + ".json";
        filename = path.join(aOutputPath, filename);
        console.log("writing to %s", filename);


        // this only sets the way to authenticate every single request
        github.authenticate({
            type: "basic",
            username: aUser,
            password: aPassword
        });

        var githubIssuesOptions = {
            user: aRepoUser,
            repo: aRepo,
            state: "open",
            //labels: "",
            sort: "created",
            //direction: "desc",
            per_page: 100 //change to 1 or 10 for testing paging
        };

        var p = Q.ninvoke(github.issues, "repoIssues", githubIssuesOptions);
        p = p.then(function (res) {
            // res is on one side an array with .length representing the issues array
            // but on the other side it contains a meta object for info an continuation

            var p1 = processIssues(res);
            var theResult = res;
            return p1.then(function () {
                return promiseWhile(function () { //condition function
                    return github.hasNextPage(theResult)
                }, function () { //loop function
                    return Q.ninvoke(github, "getNextPage", theResult).then(function (res) {
                        theResult = res;
                        return processIssues(res);
                    });
                });
            });

        });

        p = p.then(function () {
            var fd = fs.openSync(filename, "w");
            //dump first array here
            // the output is like a mongodb json dump one json per line
            for (var i = 0; i < issuesResult.length; i++) {
                fs.writeSync(fd, JSON.stringify(issuesResult[i]) + "\n");
            }
            fs.closeSync(fd);
            issuesResult = [];


            githubIssuesOptions.state = "closed";
            return Q.ninvoke(github.issues, "repoIssues", githubIssuesOptions);
        });

        p = p.then(function (res) {
            // res is on one side an array with .length representing the issues array
            // but on the other side it contains a meta object for info an continuation

            var p1 = processIssues(res);
            var theResult = res;
            return p1.then(function () {
                return promiseWhile(function () { //condition function
                    return github.hasNextPage(theResult)
                }, function () { //loop function
                    return Q.ninvoke(github, "getNextPage", theResult).then(function (res) {
                        theResult = res;
                        return processIssues(res);
                    });
                });
            });

        });

        p = p.then(function () {
            var fd = fs.openSync(filename, "a");
            //dump second array here
            // the output is like a mongodb json dump one json per line
            for (var i = 0; i < issuesResult.length; i++) {
                fs.writeSync(fd, JSON.stringify(issuesResult[i]) + "\n");
            }
            fs.closeSync(fd);
            callback(undefined, "OK");

        });
        p = p.catch(function (error) {
            // Handle any error from all above steps
            console.log("ERROR - catch:%j\n", error);
            callback("ERROR", undefined);
        })
            .done();

    }

}

module.exports = procedures.writeGHIToFile;