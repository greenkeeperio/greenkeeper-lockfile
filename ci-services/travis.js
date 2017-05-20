const env = process.env

module.exports = {
  // The GitHub repo slug
  repoSlug: env.TRAVIS_REPO_SLUG,
  // The name of the current branch
  branchName: env.TRAVIS_BRANCH,
  // The commit message of the last commit on the current branch
  commitMessage: env.TRAVIS_COMMIT_MESSAGE,
  // Is this the first push on this branch
  // i.e. the Greenkeeper commit
  firstPush: !env.TRAVIS_COMMIT_RANGE,
  // Is this a regular build
  correctBuild: env.TRAVIS_PULL_REQUEST === 'false',
  // Should the lockfile be uploaded from this build
  uploadBuild: env.TRAVIS_JOB_NUMBER.endsWith('.1')
}
