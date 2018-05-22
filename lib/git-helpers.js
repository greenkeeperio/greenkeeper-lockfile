'use strict'

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
  getLastCommitMessage: function getLastCommitMessage () {
    return exec('git log --format=%B -1').toString()
  },
  getRepoSlug: function getRepoSlug (githubUrl) {
    var ghRegex = /\S+[:|/](\w+(?:[-]\w+)*)\/(\w+(?:[-]\w+)*)/g
    var parsed = ghRegex.exec(githubUrl)
    return (
      `${parsed[1]}/${parsed[2]}`
    )
  },
  hasLockfileCommit: function hasLockfileCommit (info) {
    // CI clones are often shallow clones. Let’s make sure we have enough to work with
    // https://stackoverflow.com/a/44036486/242298
    // console.log(`git config --replace-all remote.origin.fetch +refs/heads/*:refs/remotes/origin/*`)
    exec(`git config --replace-all remote.origin.fetch +refs/heads/*:refs/remotes/origin/*`)
    // console.log(`git fetch`)
    exec(`git fetch`)
    // console.log(`git checkout master`)
    // Sometimes weird things happen with Git, so let's make sure that we have a clean
    // working tree before we go in!
    exec(`git stash`)
    exec(`git checkout master`)

    const reset = () => exec(`git checkout -`)

    // TODO: this assumes the GitHub default branch is `master`
    //       we may have to make this a config option for folks that use a different branch name
    //       as git doesn’t track where a branch is forked from, and while we do have access to
    //       GitHub here, we don’t have any GitHub API calls here yet, so it might be easier
    //       to make this a config option. This is going to be a semver-major update anyway,
    //       so we have a chance for good documentation
    // console.log(`git log --oneline origin/${info.branchName}..master | grep 'chore(package): update lockfile'`)
    try {
      exec(`git log --oneline origin/${info.branchName}...master | grep 'chore(package): update lockfile'`)
    } catch (e) {
      if (e.status === 1 &&
        e.stdout.toString() === '' &&
        e.stderr.toString() === '') { // grep didn’t find anything, and we are fine with that
        reset()
        return false // no commits
      } else if (e.status > 1) { // git or grep errored
        reset()
        throw e
      } else {
        // git succeeded, grep failed to match anything, but no error occured, e.g.: no commit yet
        reset()
        return false
      }
    }
    // git succeeded, grep found a match, we have a commit already
    reset()
    return true
  }
}
