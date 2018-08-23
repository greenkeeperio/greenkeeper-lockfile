'use strict'

const gitHelpers = require('../lib/git-helpers')

const env = process.env

module.exports = {
  repoSlug: gitHelpers.getRepoSlug(env.BUILDKITE_REPO),
  branchName: env.BUILDKITE_BRANCH,
  correctBuild: env.BUILDKITE_PULL_REQUEST === 'false',
  uploadBuild: true
}
