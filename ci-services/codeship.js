const relative = require('require-relative')
const gitHelpers = require('../lib/git-helpers')

const env = process.env
const pkg = relative('./package.json')

/**
 * Generates repoSlug from user set `GH_ORG` env var and Codeship set
 * `CI_REPO_NAME`. Fails back to extracting from `package.json`.repository.url
 */
function getRepoSlug () {
  if (env.GH_ORG) {
    return `${env.GH_ORG}/${env.CI_REPO_NAME}`
  }
  let re = /github\.com[:/]([^/]+\/[^/\.]+)/g // eslint-disable-line no-useless-escape
  let result
  if (typeof pkg.repository === 'string') {
    result = re.exec(pkg.repository)
  } else if (typeof pkg.repository.url === 'string') {
    result = re.exec(pkg.repository.url)
  }
  if (result && result[1]) {
    return result[1]
  }
  console.warn('Failed to extract repoSlug from package.json, pushes will probably fail.')
  console.warn('Set repository.url with the repo GitHub url in package.json.')
  return env.CI_REPO_NAME
}

/**
 * Should update the `package-lock.json`
 */
function shouldUpdate () {
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

`repository` key in `package.json` or GH_ORG with the org name is required, as there's no way to
get it from the ENV vars that Codeship sets.
`package.json`:
```
{
  ...
  "repository": "https://github.com/org/repo.git"
  },
  ...
}
```
```
{
  ...
  "repository": {
    "type": "git",
    "url": "https://github.com/org/repo.git"
  },
  ...
}
```
*/
