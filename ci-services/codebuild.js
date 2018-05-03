'use strict'

const gitHelpers = require('../lib/git-helpers')
const fs = require('fs')
const path = require('path')

const env = process.env

const buildConfig = path.join(env.PWD, '.gk-codebuild-config.json')

/**
 * Some of the values are not available through the build environment,
 * so we have to save them for the second run
 * (since we will be modifying the source here and e.g. the number of commits will change)
 *
 * CodeBuild will create two builds per PR, one for the branch and one for the PR.
 * The branch one is run in a detached head state, which is used do determine the info.
 * (getNumberOfCommitsOnBranch() will return 0 on the build for the PR).
 *
 * @returns {{branchName: String, numberOfCommits: Number}}
 */
function getCodeBuildInfo () {
  if (fs.existsSync(buildConfig)) {
    // This is the second run, in upload, return the JSON object
    return require(buildConfig)
  }
  const branchName = gitHelpers.getBranch()
  const numberOfCommits = gitHelpers.getNumberOfCommitsOnBranch(branchName)
  if (numberOfCommits === 0 && /^pr\/[0-9]+/.test(env.CODEBUILD_SOURCE_VERSION)) {
    console.log('greenkeeper-lockfile:codebuild', 'No commits detected for this build.')
    console.log('greenkeeper-lockfile:codebuild', 'This is expected for the PR build.')
  }
  const config = {
    branchName,
    numberOfCommits
  }
  fs.writeFileSync(buildConfig, JSON.stringify(config), 'utf-8')
  return config
}

const config = getCodeBuildInfo()

module.exports = {
  // The GitHub repo slug
  repoSlug: gitHelpers.getRepoSlug(env.CODEBUILD_SOURCE_REPO_URL),
  // The name of the current branch
  branchName: config.branchName,
  // Is this the first push on this branch
  // i.e. the Greenkeeper commit
  firstPush: config.numberOfCommits === 1,
  // Is this a regular build
  correctBuild: /^greenkeeper\/.+/.test(config.branchName),
  // Should the lockfile be uploaded from this build
  uploadBuild: true // CodeBuild does not support build matrices, yet
}
