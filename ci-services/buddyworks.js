'use strict'

const env = process.env

module.exports = {
  // The GitHub repo slug
  repoSlug: env.BUDDY_REPO_SLUG,
  // The name of the current branch
  branchName: env.BUDDY_EXECUTION_BRANCH,
  // Is this a regular build
  correctBuild: /^greenkeeper\/.+/.test(env.BUDDY_EXECUTION_BRANCH),
  // Should the lockfile be uploaded from this build
  uploadBuild: true
}
