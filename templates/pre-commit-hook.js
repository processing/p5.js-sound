 // hooks/pre-commit.js

 const exec = require('child_process').exec;
 // Executes shell commands synchronously
 const sh = require('child_process').execSync;
 
 exec('git diff --cached --quiet', function (err, stdout, stderr) {
 
  // only run if there are staged changes
  // i.e. what you would be committing if you ran "git commit" without "-a" option.
  if (err) {
 
  // stash unstaged changes - only test what's being committed
  sh('git stash --keep-index --quiet');
 
  exec('grunt {{task}}', function (err, stdout, stderr) {
 
  console.log(stdout);
 
  // restore stashed changes
  sh('git stash pop --quiet');
 
  let exitCode = 0;
  if (err) {
  console.log(stderr);
  exitCode = -1;
  }
  process.exit(exitCode);
  });
  }
 
 });