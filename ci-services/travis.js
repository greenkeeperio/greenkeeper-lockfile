'use strict'

const env = process.env

module.exports = {
  // The GitHub repo slug
  repoSlug: env.TRAVIS_REPO_SLUG,
  // The name of the current branch
  branchName: env.TRAVIS_BRANCH,
  // Is this a regular build
  correctBuild: env.TRAVIS_PULL_REQUEST === 'false',
  // Should the lockfile be uploaded from this build
  uploadBuild: env.TRAVIS_JOB_NUMBER.endsWith(`.${env.BUILD_LEADER_ID || 1}`)
}
