'use strict'

const env = process.env

/**
 * Should update the `package-lock.json`
 * Thanks @selbyk
 */
function shouldUpdate () {
  let re = /^(chore|fix)\(package\): update [^ ]+ to version.*$/mi
  return re.test(env.APPVEYOR_REPO_COMMIT_MESSAGE)
}

module.exports = {
  repoSlug: env.APPVEYOR_REPO_NAME,
  branchName: env.APPVEYOR_REPO_BRANCH,
  firstPush: shouldUpdate(),
  correctBuild: !env.APPVEYOR_PULL_REQUEST_NUMBER,
  uploadBuild: shouldUpdate()
}
