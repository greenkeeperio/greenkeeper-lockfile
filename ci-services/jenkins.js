'use strict'

const env = process.env

// Jenkins reports the branch name and Git URL in a couple of different places depending on use of the new
// pipeline vs. older job types.
const gitUrl = env.CHANGE_URL || env.GIT_URL
const origBranch = env.CHANGE_TARGET || env.CHANGE_BRANCH || env.BRANCH_NAME || env.GIT_BRANCH

// Different Jenkins plugins format the branch name differently
const matchesGreenkeeper = origBranch.match(/greenkeeper.*/)
const branchName = matchesGreenkeeper ? matchesGreenkeeper[0] : origBranch

module.exports = {
  gitUrl,
  branchName,
  correctBuild: true, // assuming this is always the correct build to update the lockfile
  uploadBuild: true // assuming 1 build per branch/PR
}
