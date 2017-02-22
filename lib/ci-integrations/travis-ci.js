const env = process.env

function test () {
  return env.TRAVIS === 'true'
}

function getValues () {
  return {
    isPullRequest: env.TRAVIS_PULL_REQUEST !== 'false',
    commitMessage: env.TRAVIS_COMMIT_MESSAGE,
    gitBranchName: env.TRAVIS_BRANCH,
    shouldUpload: env.TRAVIS_JOB_NUMBER.endsWith('.1'),
    githubRepoSlug: env.TRAVIS_REPO_SLUG
  }
}

module.exports = {
  test: test,
  getValues: getValues
}
