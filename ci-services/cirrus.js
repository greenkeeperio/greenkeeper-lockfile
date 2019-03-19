'use strict'

const env = process.env

module.exports = {
  // The GitHub repo slug
  repoSlug: env.CIRRUS_REPO_FULL_NAME,
  // The name of the current branch
  branchName: env.CIRRUS_BRANCH,
  // Is this a regular build
  correctBuild: !env.CIRRUS_PR,
  // Should the lockfile be uploaded from this build
  uploadBuild: env.CI === 'true'
}
