const _ = require('lodash')

const gitHelpers = require('../lib/git-helpers')

const config = require('../lib/config')

const env = process.env

function isFirstPush (branch, sha1) {
  const commitNumber = gitHelpers.getNumberOfCommitsOnBranch(branch)
  const commitMessage = gitHelpers.getCommitMessage(sha1).trim()
  // CircleCI 2.0 enviroment treats first push as 0, and also ignore the commit from greenkeeper update
  const fallsIntoCommitRange = commitNumber <= 2

  if (
    fallsIntoCommitRange &&
    !_.includes(config.updateMessage, commitMessage)
  ) {
    return true
  }

  return false
}

module.exports = {
  repoSlug: `${env.CIRCLE_PROJECT_USERNAME}/${env.CIRCLE_PROJECT_REPONAME}`,
  branchName: env.CIRCLE_BRANCH,
  firstPush: isFirstPush(env.CIRCLE_BRANCH, env.CIRCLE_SHA1),
  correctBuild: _.isEmpty(env.CI_PULL_REQUEST),
  uploadBuild: env.CIRCLE_NODE_INDEX === '0'
}
