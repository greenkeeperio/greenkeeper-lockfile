const env = process.env
const _ = require('lodash')
const exec = require('child_process').execSync

function getNumberOfCommitsOnBranch () {
  const grepAgument = `refs/heads/${env.CIRCLE_BRANCH}`
  const notArgument = `$(git for-each-ref --format="%(refname)" refs/heads/ | grep -v ${grepAgument})`
  return _.toNumber(
    exec(
      `git log ${env.CIRCLE_BRANCH} --oneline --not ${notArgument} | wc -l`
    ).toString()
  )
}

function getCommitMessage () {
  return exec('git log --format="%s" -n1 $CIRCLE_SHA1').toString()
}

module.exports = {
  // The GitHub repo slug
  repoSlug: `${env.CIRCLE_PROJECT_USERNAME}/${env.CIRCLE_PROJECT_REPONAME}`,
  // The name of the current branch
  branchName: env.CIRCLE_BRANCH,
  // The commit message of the last commit on the current branch
  commitMessage: getCommitMessage(),
  // Is this the first push on this branch
  // i.e. the Greenkeeper commit
  firstPush: getNumberOfCommitsOnBranch() === 1,
  // Is this a regular build
  correctBuild: _.isEmpty(env.CI_PULL_REQUEST),
  // Should the lockfile be uploaded from this build
  uploadBuild: env.CIRCLE_NODE_INDEX === '0'
}
