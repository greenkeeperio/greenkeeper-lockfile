'use strict'

const forEach = require('lodash/forEach')
const env = process.env

const _export = {
  // The GitHub repo slug
  repoSlug: env.GK_LOCK_GENERIC_CI_REPO_SLUG,
  // The name of the current branch
  branchName: env.GK_LOCK_GENERIC_CI_BRANCH_NAME,
  // Is this the first push of the build
  firstPush: env.GK_LOCK_GENERIC_CI_FIRST_PUSH,
  // Is this a regular build
  correctBuild: env.GK_LOCK_GENERIC_CI_CORRECT_BUILD,
  // Should the lockfile be uploaded from this build
  uploadBuild: env.GK_LOCK_GENERIC_CI_UPLOAD_BUILD
}

let hasMissingVars = false
forEach(_export, (value, key) => {
  if (!value) {
    console.error(`${key} missing`)
    hasMissingVars = true
  }
})

if (!hasMissingVars) {
  for (const k of ['firstPush', 'correctBuild', 'uploadBuild']) {
    _export[k] = _export[k] === 'true'
  }

  module.exports = _export
}
