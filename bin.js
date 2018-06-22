#!/usr/bin/env node

'use strict'

const exec = require('child_process').execSync
const url = require('url')

const config = require('./lib/config')
const hasLockfileCommit = require('./lib/git-helpers').hasLockfileCommit

const lockfile = require('./lib/update-lockfile')
const stageLockfiles = lockfile.stageLockfiles
const commitLockfiles = lockfile.commitLockfiles

const ci = require('./ci-services')
const env = process.env

module.exports = function update () {
  const info = ci()

  // legacy support
  if (config.branchPrefix === 'greenkeeper/' && info.branchName.startsWith('greenkeeper-')) {
    config.branchPrefix = 'greenkeeper-'
  }

  if (!info.branchName) {
    return console.error('No branch details set, so assuming not a Greenkeeper branch')
  }

  if (!info.branchName.startsWith(config.branchPrefix)) {
    return console.error(`'${info.branchName}' is not a Greenkeeper branch`)
  }

  if (info.branchName === `${config.branchPrefix}initial`) {
    // This should be possible to do, Contributions are welcome!
    return console.error(`'${info.branchName}' is the initial Greenkeeper branch, please update the lockfile manualy`)
  }

  if (!info.correctBuild) {
    return console.error('This build should not update the lockfile. It could be a PR, not a branch build.')
  }

  if (hasLockfileCommit(info)) {
    return console.error('greenkeeper-lockfile already has a commit on this branch')
  }

  stageLockfiles()
  commitLockfiles()

  if (env.NODE_ENV && env.NODE_ENV !== 'test') {
    console.log('Lockfiles updated')
  }

  if (!info.uploadBuild) {
    return console.error('Only uploading on one build job')
  }

  let remote = `git@github.com:${info.repoSlug}`
  if (info.gitUrl) remote = info.gitUrl

  if (env.GH_TOKEN) {
    if (remote.slice(0, 5) !== 'https') remote = `https://github.com/${info.repoSlug}`
    const urlParsed = url.parse(remote)
    urlParsed.auth = env.GH_TOKEN
    remote = url.format(urlParsed)
  }

  exec(`git remote add gk-origin ${remote} || git remote set-url gk-origin ${remote}`)
  exec(`git push${env.GK_LOCK_COMMIT_AMEND ? ' --force-with-lease' : ''} gk-origin HEAD:${info.branchName}`)
}
if (require.main === module) module.exports()
