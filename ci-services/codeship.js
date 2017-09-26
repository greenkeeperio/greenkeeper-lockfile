const gitHelpers = require('../lib/git-helpers')

const env = process.env

module.exports = {
  // The GitHub repo slug
  repoSlug: env.CI_REPO_NAME,
  // The name of the current branch
  branchName: env.CI_BRANCH,
  // Is this the first push on this branch
  // i.e. the Greenkeeper commit
  firstPush: gitHelpers.getNumberOfCommitsOnBranch(env.CI_BRANCH) === 1,
  // Is this a regular build (use tag: ^greenkeeper/)
  correctBuild: true,
  // Should the lockfile be uploaded from this build (use tag: ^greenkeeper/)
  uploadBuild: true,
  firstNum: gitHelpers.getNumberOfCommitsOnBranch(env.CI_BRANCH)
}

/*
Example `codeship-steps.yml`:
```yml
- name: "Greenkeeper: install greenkeeper-lockfile"
  tag: ^greenkeeper/
  service: app
  command: npm i -g greenkeeper-lockfile
- name: "Greenkeeper: update lockfile"
  tag: ^greenkeeper/
  service: app
  command: greenkeeper-lockfile-update
- name: Test
  service: app
  command: npm run codeship-test
- name: "Greenkeeper: pushing lockfile"
  tag: ^greenkeeper/
  service: app
  command: greenkeeper-lockfile-upload
```
*/
