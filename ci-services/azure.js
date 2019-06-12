'use strict'

const _ = require('lodash')
const gitHelpers = require('../lib/git-helpers')

const env = process.env

/**
 * Last commit is a lockfile update
 */
function isLockfileUpdate () {
  const reUpdateLockfile = /^(chore|fix)\(package\): update [^ ]+ to version.*$/mi
  const lastCommitMessage = gitHelpers.getLastCommitMessage()
  return reUpdateLockfile.test(lastCommitMessage)
}

module.exports = {
  repoSlug: env.BUILD_REPOSITORY_NAME,
  branchName: ! _.isEmpty(env.BUILD_SOURCEBRANCHNAME) ? env.BUILD_SOURCEBRANCHNAME : env.SYSTEM_PULLREQUEST_SOURCEBRANCH,
  correctBuild: env.SYSTEM_PULLREQUEST_PULLREQUESTID === '',
  uploadBuild: isLockfileUpdate()
}
