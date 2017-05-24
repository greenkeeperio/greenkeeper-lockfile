const _ = require('lodash')

const env = process.env

function getNumberOfCommitsOnBranch () {
  const grepAgument = `refs/heads/${env.CIRCLE_BRANCH}`
  const notArgument = `$(git for-each-ref --format="%(refname)" refs/heads/ | grep -v ${grepAgument})`
  return _.toNumber(
    exec(
      `git log ${env.CIRCLE_BRANCH} --oneline --not ${notArgument} | wc -l`
    ).toString()
  )
}

module.exports = {
  repoSlug: `${env.CIRCLE_PROJECT_USERNAME}/${env.CIRCLE_PROJECT_REPONAME}`,
  branchName: env.CIRCLE_BRANCH,
  firstPush: getNumberOfCommitsOnBranch() === 1,
  correctBuild: _.isEmpty(env.CI_PULL_REQUEST),
  uploadBuild: env.CIRCLE_NODE_INDEX === '0'
}
