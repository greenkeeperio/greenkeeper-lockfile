'use strict'

const _ = require('lodash')

const env = process.env

module.exports = {
  repoSlug: env.SEMAPHORE_REPO_SLUG,
  branchName: env.BRANCH_NAME,
  firstPush: env.SEMAPHORE_BUILD_NUMBER === '1',
  correctBuild: _.isEmpty(env.PULL_REQUEST_NUMBER),
  uploadBuild: env.SEMAPHORE_CURRENT_JOB === '1'
}
