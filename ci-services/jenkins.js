'use strict'

const env = process.env

const _ = require('lodash')

// Jenkins reports the branch name and Git URL in a couple of different places depending on use of the new
// pipeline vs. older job types.
const gitUrl = env.CHANGE_URL || env.GIT_URL
const origBranch = env.CHANGE_BRANCH || env.GIT_BRANCH

// Different Jenkins plugins format the branch name differently
const matchesGreenkeeper = origBranch.match(/greenkeeper.*/)
const branchName = matchesGreenkeeper ? matchesGreenkeeper[0] : origBranch

module.exports = {
  gitUrl,
  branchName,
  correctBuild: true, // assuming pull requests are not build
  uploadBuild: true // assuming 1 build per branch
}
