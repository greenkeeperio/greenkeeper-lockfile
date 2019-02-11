'use strict'

const env = process.env

module.exports = {
  repoSlug: env.CI_PROJECT_PATH_SLUG,
  branchName: env.CI_COMMIT_REF_NAME,
  correctBuild: /^greenkeeper\/.+/.test(env.CI_COMMIT_REF_NAME),
  uploadBuild: true
}
