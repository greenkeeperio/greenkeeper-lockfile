'use strict'

const _ = require('lodash')
const gitHelpers = require('../lib/git-helpers')

const env = process.env

module.exports = {
  repoSlug: `${env.CIRCLE_PROJECT_USERNAME}/${env.CIRCLE_PROJECT_REPONAME}`,
  branchName: env.CIRCLE_BRANCH,
  firstPush: gitHelpers.getNumberOfCommitsOnBranch(env.CIRCLE_BRANCH) === 1,
  correctBuild: _.isEmpty(env.CI_PULL_REQUEST),
  uploadBuild: env.CIRCLE_NODE_INDEX === `${env.BUILD_LEADER_ID || 0}`
}
