'use strict'

const env = process.env

const _ = require('lodash')
const gitHelpers = require('../lib/git-helpers')

module.exports = {
  gitUrl: env.GIT_URL,
  branchName: _.drop(_.split(env.GIT_BRANCH, '/')).join('/'),
  firstPush: gitHelpers.getNumberOfCommitsOnBranch(env.GIT_BRANCH) === 1,
  correctBuild: true, // assuming pull requests are not build
  uploadBuild: true // assuming 1 build per branch
}
