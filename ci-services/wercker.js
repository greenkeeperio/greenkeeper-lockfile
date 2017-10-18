'use strict'

const gitHelpers = require('../lib/git-helpers')

const env = process.env

module.exports = {
  repoSlug: `${env.WERCKER_GIT_OWNER}/${env.WERCKER_GIT_REPOSITORY}`,
  branchName: env.WERCKER_GIT_BRANCH,
  firstPush: gitHelpers.getNumberOfCommitsOnBranch(env.WERCKER_GIT_BRANCH) === 1,
  correctBuild: env.WERCKER_GIT_DOMAIN === 'github.com',

  // In wercker, only add the upload step to the pipeline you'd want to upload from
  uploadBuild: true
}
