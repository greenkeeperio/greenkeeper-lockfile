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
  correctBuild: !env.APPVEYOR_PULL_REQUEST_NUMBER,
  uploadBuild: shouldUpdate(),
  // Used to ignore output when staging the updated lockfile
  // The Windows equivalent of '2>/dev/null || true' is '2>NUL || (exit 0)'
  ignoreOutput: '2>NUL || (exit 0)'
}
