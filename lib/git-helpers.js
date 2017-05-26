const exec = require('child_process').execSync

const _ = require('lodash')

module.exports = {
  getNumberOfCommitsOnBranch: function getNumberOfCommitsOnBranch (branch) {
    const grepAgument = `refs/heads/${branch}`
    const notArgument = `$(git for-each-ref --format="%(refname)" refs/heads/ | grep -v ${grepAgument})`
    return _.toNumber(
      exec(
        `git log ${branch} --oneline --not ${notArgument} | wc -l`
      ).toString()
    )
  },
  getCommitMessage: function getCommitMessage (sha1) {
    return exec(`git log --format="%s" -n1 ${sha1}`).toString()
  }
}
