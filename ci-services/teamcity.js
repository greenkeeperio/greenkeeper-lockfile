'use strict'

const exec = require('child_process').execSync
const gitHelpers = require('../lib/git-helpers')

const gitUrl = exec('git config --get remote.origin.url').toString().trim()
const branchName = exec('git rev-parse --abbrev-ref HEAD').toString().trim()

module.exports = {
  repoSlug: gitHelpers.getRepoSlug(gitUrl),
  branchName: branchName,
  firstPush: gitHelpers.getNumberOfCommitsOnBranch(branchName) === 1,
  correctBuild: true,
  uploadBuild: true
}
