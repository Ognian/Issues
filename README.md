
# node.js module for downloading all github issues of a public or private repository to a file (json).


```
USAGE: node getGHIssues.js [OPTIONS] , where OPTIONS are:
  -a, --authUser <ARG1> <ARG2>  authenticate as user with password (eg. -a user1 pwd1) (mandatory)
  -r, --repo <ARG1> <ARG2>      repository in the form username repository name (eg. -a user1 repo2) (mandatory)
  -o, --outputPath <ARG1>       output Path (default ./data)
```

### Uses:

- https://github.com/mikedeboer/node-github
- https://github.com/sgmonda/stdio

