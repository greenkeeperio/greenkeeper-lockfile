const gitHelpers = require('../lib/git-helpers')

const env = process.env

module.exports = {
  // The GitHub repo slug
  repoSlug: env.CI_REPO_NAME,
  // The name of the current branch
  branchName: env.CI_BRANCH,
  // Is this the first push on this branch
  // i.e. the Greenkeeper commit
  firstPush: gitHelpers.getNumberOfCommitsOnBranch(env.CI_BRANCH) === 1 || env.CI_BRANCH === 'greenkeeper/initial',
  // Is this a regular build
  correctBuild: true,
  // Should the lockfile be uploaded from this build
  uploadBuild: true
}
