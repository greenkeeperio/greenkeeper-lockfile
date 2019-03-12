'use strict'

const env = process.env

module.exports = {
  repoSlug: env.SEMAPHORE_REPO_SLUG,
  branchName: env.BRANCH_NAME,
  correctBuild: !env.PULL_REQUEST_NUMBER,
  uploadBuild: env.SEMAPHORE_CURRENT_JOB === '1'
}
