'use strict'

const env = process.env

module.exports = {
  repoSlug: env.APPVEYOR_REPO_NAME,
  branchName: env.APPVEYOR_REPO_BRANCH,
  firstPush: env.APPVEYOR_JOB_NUMBER === '1',
  correctBuild: !env.APPVEYOR_PULL_REQUEST_NUMBER,
  uploadBuild: true
}
