'use strict'

const env = process.env

/**
 * Should update the `package-lock.json`
 */
function shouldUpdate () {
  let re = /^(chore|fix)\(package\): update [^ ]+ to version.*$/mi
  return re.test(env.DRONE_COMMIT_MESSAGE)
}

module.exports = {
  // The GitHub repo slug
  repoSlug: env.DRONE_REPO,
  // The name of the current branch
  branchName: env.DRONE_COMMIT_BRANCH,
  // Is this the first push on this branch
  // i.e. the Greenkeeper commit
  firstPush: shouldUpdate(),
  // Is this a regular build
  correctBuild: env.DRONE_BUILD_EVENT === 'push',
  // Should the lockfile be uploaded from this build
  uploadBuild: env.DRONE_JOB_NUMBER.endsWith('1'),
  // The git url
  gitUrl: env.DRONE_REMOTE_URL
}
