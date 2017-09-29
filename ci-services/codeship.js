const relative = require('require-relative')
const gitHelpers = require('../lib/git-helpers')

const env = process.env
const pkg = relative('./package.json')

function getRepoSlug() {
  if(env.GH_ORG) {
    return `${env.GH_ORG}/${env.CI_REPO_NAME}`
  } else {
    console.info('Missing GH_ORG environment variable, extracting repoSlug from package.json')
    let re = /github\.com[:/]([^/]+\/[^/\.]+)/g
    let result
    if(pkg.repository.url){
      result = re.exec(pkg.repository.url)
      if(result && result[1]) {
        return result[1]
      }
    }
    console.warn('Failed to extract repoSlug from package.json, pushes will probably fail.')
    console.warn('Set repository.url with the repo GitHub url in package.json.')
    return env.CI_REPO_NAME
  }
}

function shouldUpdate() {
  let re = /^(chore|fix)\(package\): update [^ ]+ to version.*$/mi
  return re.test(env.CI_COMMIT_MESSAGE)
}

module.exports = {
  // The GitHub repo slug
  repoSlug: getRepoSlug(),
  // The name of the current branch
  branchName: env.CI_BRANCH,
  // Is this the first push on this branch
  // i.e. the Greenkeeper commit
  firstPush: shouldUpdate(),
  // Is this a regular build (use tag: ^greenkeeper/)
  correctBuild: shouldUpdate(),
  // Should the lockfile be uploaded from this build (use tag: ^greenkeeper/)
  uploadBuild: shouldUpdate(),
  commitNum: gitHelpers.getNumberOfCommitsOnBranch(env.CI_BRANCH),
  realFirstPush: gitHelpers.getNumberOfCommitsOnBranch(env.CI_BRANCH) === 1
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
