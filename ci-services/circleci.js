'use strict'

const _ = require('lodash')
const gitHelpers = require('../lib/git-helpers')

const env = process.env

/**
 * Last commit is a lockfile update
 */
function isLockfileUpdate () {
  const reUpdateLockfile = /^chore\(package\): update lockfiles*$/mi
  const lastCommitMessage = gitHelpers.getLastCommitMessage()
  return reUpdateLockfile.test(lastCommitMessage)
}

module.exports = {
  repoSlug: `${env.CIRCLE_PROJECT_USERNAME}/${env.CIRCLE_PROJECT_REPONAME}`,
  branchName: env.CIRCLE_BRANCH,
  // update, CIRCLE_PREVIOUS_BUILD_NUM is only null on the first job of the first workflow on the branch
  correctBuild: _.isEmpty(env.CI_PULL_REQUEST) && !env.CIRCLE_PREVIOUS_BUILD_NUM,
  // upload when last commit is lockfile update
  uploadBuild: env.CIRCLE_NODE_INDEX === `${env.BUILD_LEADER_ID || 0}` && isLockfileUpdate()
}
