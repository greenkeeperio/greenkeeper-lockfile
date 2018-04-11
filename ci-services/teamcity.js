const gitHelpers = require('../lib/git-helpers')

const env = process.env

/**
 * In order for this to work with Team City, the build configuration needs to set
 * the following environment variables:
 *
 * - VCS_ROOT_URL from the vcsroot.<vcsrootid>.url parameter
 * - VCS_ROOT_BRANCH from the teamcity.build.branch parameter
 */

/**
 * Is the current branch a pull request
 */
function isPullRequest () {
  return /.+\/merge|head/.test(env.VCS_ROOT_BRANCH)
}

/**
 * Should the lockfile be uploaded
 */
function shouldUpload () {
  const re = /^(chore|fix)\(package\): update lockfile|([^ ]+ to version).*$/mi
  const lastCommitMessage = gitHelpers.getLastCommitMessage()
  return re.test(lastCommitMessage)
}

module.exports = {
  repoSlug: gitHelpers.getRepoSlug(env.VCS_ROOT_URL),
  branchName: env.VCS_ROOT_BRANCH,
  firstPush: shouldUpload(),
  correctBuild: !isPullRequest(),
  uploadBuild: shouldUpload()
}
