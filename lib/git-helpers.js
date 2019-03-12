'use strict'

const url = require('url')
const exec = require('child_process').execSync

const _ = require('lodash')
const env = process.env

const DEBUG = env.GK_LOCK_DEBUG || false

function setupRemote (info) {
  let remote = `git@github.com:${info.repoSlug}`
  if (info.gitUrl) remote = info.gitUrl

  if (env.GH_TOKEN) {
    if (remote.slice(0, 5) !== 'https') remote = `https://github.com/${info.repoSlug}`
    const urlParsed = url.parse(remote)
    urlParsed.auth = env.GH_TOKEN
    remote = url.format(urlParsed)
  }
  exec(`git remote add gk-origin ${remote} || git remote set-url gk-origin ${remote}`)
}

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
  getGitURL: function getGitURL () {
    return exec('git config remote.origin.url').toString().trim()
  },
  getRepoSlug: function getRepoSlug (githubUrl) {
    const ghRegex = /\S+[:|/](\w+(?:[-]\w+)*)\/(\w+(?:[-]\w+)*)/g
    const parsed = ghRegex.exec(githubUrl)
    return (
      `${parsed[1]}/${parsed[2]}`
    )
  },
  hasLockfileCommit: function hasLockfileCommit (info) {
    setupRemote(info)
    const defaultBranch = env.GK_LOCK_DEFAULT_BRANCH || 'master'
    // CI clones are often shallow clones. Let’s make sure we have enough to work with
    // https://stackoverflow.com/a/44036486/242298
    // console.log(`git config --replace-all remote.origin.fetch +refs/heads/*:refs/remotes/origin/*`)
    exec(`git config --replace-all remote.origin.fetch +refs/heads/*:refs/remotes/origin/*`)
    // console.log(`git fetch`)
    exec(`git fetch gk-origin`)
    // console.log(`git checkout master`)
    // Sometimes weird things happen with Git, so let's make sure that we have a clean
    // working tree before we go in!
    exec(`git stash`)
    exec(`git checkout ${defaultBranch}`)

    DEBUG && console.log('sucessfully funged the git repo, so we can diff this branch against the default branch')

    const reset = () => exec(`git checkout -`)

    try {
      const gitShowCmd = `git show --oneline --name-only origin/${info.branchName}...${defaultBranch}`
      const grepCmd = `grep -E '(package-lock.json|npm-shrinkwrap.json|yarn.lock)'`
      DEBUG && console.log(`about to run ${gitShowCmd} | ${grepCmd}`)
      exec(`${gitShowCmd} | ${grepCmd}`)
    } catch (e) {
      if (e.status === 1 &&
        e.stdout.toString() === '' &&
        e.stderr.toString() === '') { // grep didn’t find anything, and we are fine with that
        reset()
        DEBUG && console.log('grep found no matching commits: ')
        return false // no commits
      } else if (e.status > 1) { // git or grep errored
        reset()
        DEBUG && console.log('git or grep errored')
        throw e
      } else {
        // git succeeded, grep failed to match anything, but no error occured, i,e.: no commit yet
        DEBUG && console.log('git succeeded, grep failed to match anything, but no error occured, i.e.: no commit yet')
        reset()
        return false
      }
    }
    // git succeeded, grep found a match, we have a commit already
    DEBUG && console.log('git succeeded, grep foudn a match, we have a commit already')
    reset()
    return true
  },
  getBranch: function getBranch () {
    const branch = exec('git show -s --pretty=%d HEAD')
      .toString()
      .match(/\(?([^)]+)\)?/)[1]
      .split(', ')
      .find(branch => branch.startsWith('origin/'))

    return branch
      ? branch.match(/^origin\/(.+)/)[1]
      : exec('git rev-parse --abbrev-ref HEAD').toString().trim()
  }
}
