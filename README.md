
# app and utility for downloading all github issues of a public or private repository to a file (json).
There are 2 way's to use this utility:
1. start the web app via

```
node app.js
```

and go to http://localhost:3001
2. use the command line utility ghIssues.js

```
 ./ghIssues.js

    Usage: ghIssues.js [options] [command]

    Commands:

      save <user> <password> <repoUser> <repo> ... authenticate at github as user <user> <password> and get all issues and comments from the repository <repoUser>/<repo>.
                                                   They are saved as: Issues_<repoUser>_<repo>_YYYY_MM_DD_HH24_MI_SS.json, where YYYY_MM_DD_HH24_MI_SS is the current timestamp.

    Options:

      -h, --help               output usage information
      -V, --version            output the version number
      -o, --outputPath [path]  output Path default: ./data

```

It can be used to download the issues in a file via GUI and to display the downloaded issues as html.

The resulting html can also be saved as a pdf, but until paged media support is added to the major browsers you can use command line tools like e.g. [prince](http://www.princexml.com).

All timestamps are UTC.
The github api has limits on how many request per hour can be made, even if you authenticate first. So after approx. 2000 Issues maybe the limit will be reached. For more info see the help for the github api. v3. on github.

To be able to download the report as pdf you have to install wkhtmltopdf on your system.