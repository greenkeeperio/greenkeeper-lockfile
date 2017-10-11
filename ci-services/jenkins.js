const env = process.env

const _ = require('lodash')
const gitHelpers = require('../lib/git-helpers')

// Jenkins reports the branch name and Git URL in a couple of different places depending on use of the new
// pipeline vs. older job types.
const branchName = env.CHANGE_BRANCH || env.GIT_BRANCH
const gitUrl = env.CHANGE_URL || env.GIT_URL

// Build number is available in Jenkins pipeline builds; for others, defer to asking GIT.
const buildNumber = env.BUILD_NUMBER || gitHelpers.getNumberOfCommitsOnBranch(branchName)

module.exports = {
  gitUrl,
  branchName,
  firstPush: buildNumber === 1,
  correctBuild: true, // assuming this is always the correct build to update the lockfile
  uploadBuild: true // assuming 1 build per branch/PR
}
