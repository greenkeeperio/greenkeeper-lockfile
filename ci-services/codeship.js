const exec = require('child_process').execSync
const gitHelpers = require('../lib/git-helpers')

const env = process.env

function getRepoSlug() {
  if(env.GH_ORG) {
    return `${env.GH_ORG}/${env.CI_REPO_NAME}`
  } else {
    console.info('Missing GH_ORG environment variable, extracting repoSlug from remote origin.')
    let re = /github\.com[:/]([^/]+\/[^/\.]+)/g
    let result;
    try {
      let gitOriginUrl = exec(`git remote get-url origin`).toString()
      result = re.exec(gitOriginUrl);
      return result[1]
    } catch(e) {
      console.warn('Failed to extract repoSlug from remote origin, pushes will probably fail.')
      console.warn('Set GH_ORG environment variable with your GitHub organization name.')
      return env.CI_REPO_NAME
    }
  }
}

module.exports = {
  // The GitHub repo slug
  repoSlug: getRepoSlug(),
  // The name of the current branch
  branchName: env.CI_BRANCH,
  // Is this the first push on this branch
  // i.e. the Greenkeeper commit
  firstPush: true,
  // Is this a regular build (use tag: ^greenkeeper/)
  correctBuild: true,
  // Should the lockfile be uploaded from this build (use tag: ^greenkeeper/)
  uploadBuild: true,
  commitNum: gitHelpers.getNumberOfCommitsOnBranch(env.CI_BRANCH),
  realFirstPush: gitHelpers.getNumberOfCommitsOnBranch(env.CI_BRANCH) === 1,
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
