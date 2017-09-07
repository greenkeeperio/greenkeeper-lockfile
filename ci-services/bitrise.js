const gitHelpers = require('../lib/git-helpers')

const env = process.env

// http://devcenter.bitrise.io/faq/available-environment-variables/

function parseRepoSlug (repoUrl) {
  const repoUrlWithoutGitExtension = repoUrl.replace('.git', '')
  const lastSegmentOfRepoUrl = repoUrlWithoutGitExtension.split(':').pop() // split at protocoll eg. git://... or git@github.com:... and only retain the relevant last segment
  const splitAtSlash = lastSegmentOfRepoUrl.split('/')
  const repoName = splitAtSlash.pop()
  const repoOwner = splitAtSlash.pop()

  return `${repoOwner}/${repoName}`
}

module.exports = {
  // The GitHub repo slug
  repoSlug: parseRepoSlug(env.GIT_REPOSITORY_URL),
  // The name of the current branch
  branchName: env.BITRISE_GIT_BRANCH,
  // Is this the first push on this branch
  // i.e. the Greenkeeper commit
  firstPush: gitHelpers.getNumberOfCommitsOnBranch(env.BITRISE_GIT_BRANCH) === 1,
  // Is this a regular build
  correctBuild: env.PR === 'false',
  // Should the lockfile be uploaded from this build
  uploadBuild: true
}
