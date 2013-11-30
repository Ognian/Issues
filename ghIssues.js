#!/usr/bin/env node
/**
 * Created by ogi on 23.11.13.
 */

/**
 * Module dependencies.
 */
var program = require('commander');
var ghi = require('./GithubIssues.js');
var command_started=false;

program
    //.version('0.0.2')
    .version(require('./package.json').version)
    //.usage('<user> <password> <repoUser> <repo>')
    .option('-o, --outputPath [path]', 'output Path default: ./data', './data')  //put it here, otherwise options are NOT global...

program
    .command('save <user> <password> <repoUser> <repo>')
    //.option('-o, --outputPath [path]', 'output Path default: ./data', './data')
    .description('... authenticate at github as user <user> <password> and get all issues and comments from the repository <repoUser>/<repo>.\n\t\t\t\t\t\t They are saved as: Issues_<repoUser>_<repo>_YYYY_MM_DD_HH24_MI_SS.json, where YYYY_MM_DD_HH24_MI_SS is the current timestamp.')
    .action(function (user, password, repoUser, repo, options) {
        //console.log("SAVE");
        ghi.getAllGHIssues.call (undefined, user, password, repoUser, repo, program.outputPath); //program.outoutPath -> global option: option.outputPath -> local (command) option
        command_started=true;
        //never ever write a process.exit here!!!
        //process.exit in an async pgm can lead to terrible effects  !!!!!
    });

var cmd=program.parse(process.argv);

//after starting up an async command we get here
//nodejs waits until all these async stuff finishes and after that exits with exit code 0
//so the worst thing you could do is add here a process.exit() witch would terminate immediately and stop all the async work

if(!command_started){
    console.error('Enter a valid command.');
    program.help();
}
//do not enter any code here! see above!