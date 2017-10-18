'use strict'

const env = process.env
const gitHelpers = require('../lib/git-helpers')

module.exports = {
  gitUrl: env.GIT_URL,
  branchName: env.GIT_BRANCH,
  firstPush: gitHelpers.getNumberOfCommitsOnBranch(env.GIT_BRANCH) === 1,
  correctBuild: true, // assuming pull requests are not build
  uploadBuild: true // assuming 1 build per branch
}
