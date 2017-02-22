const exec = require('child_process').execSync
const _ = require('lodash')

const env = process.env

function test () {
  return env.CIRCLECI === 'true'
}

function getValues () {
  const commitMessage = exec('git log --format="%s"  -n1 $CIRCLE_SHA1').toString()

  return {
    isPullRequest: !_.isEmpty(env.CI_PULL_REQUEST),
    commitMessage: commitMessage,
    gitBranchName: env.CIRCLE_BRANCH,
    shouldUpload: env.CIRCLE_NODE_INDEX === '0',
    githubRepoSlug: `${env.CIRCLE_PROJECT_USERNAME}/${env.CIRCLE_PROJECT_REPONAME}`
  }
}

module.exports = {
  test: test,
  getValues: getValues
}
