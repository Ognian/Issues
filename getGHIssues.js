/**
 * Created by ogi on 03.07.14.
 */

var stdio = require('stdio');
var writeGHIToFile = require("./getGHIssuesPromised.js");

var options = stdio.getopt({
    'authUser': {key: 'a', description: 'authenticate as user with password (eg. -a user1 pwd1)', mandatory: true, args: 2},
    'repo': {key: 'r', description: 'repository in the form username repository name (eg. -a user1 repo2)', mandatory: true, args: 2},
    'outputPath': {key: 'o', description: 'output Path (default ./data)', args: 1}
});

if (!options.outputPath) {
    options.outputPath = "./data";
}

writeGHIToFile(options.authUser[0], options.authUser[1], options.repo[0], options.repo[1], options.outputPath, function (err, res) {
    "use strict";
    if (err) {
        console.log("finshed with error %j", err)
    } else {
        console.log("finshed with result %j", res)
    }

});