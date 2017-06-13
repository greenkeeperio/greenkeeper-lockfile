const exec = require('child_process').execSync

const _ = require('lodash')

module.exports = {
  getNumberOfCommitsOnBranch: function getNumberOfCommitsOnBranch (branch) {
    const refArgument = `$(git for-each-ref '--format=%(refname)' refs/ | grep /${branch} | head -1)`
    const notArgument = `$(git for-each-ref '--format=%(refname)' refs/ | grep -v /${branch})`
    return _.toNumber(
      exec(
        `git log ${refArgument} --oneline --not ${notArgument} | wc -l`
      ).toString()
    )
  },
  getCommitMessage: function getCommitMessage (sha1) {
    return exec(`git log --format="%s" -n1 ${sha1}`).toString()
  }
}
