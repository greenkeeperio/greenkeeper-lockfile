#!/usr/bin/env node

'use strict'

const exec = require('child_process').execSync
const url = require('url')
const fs = require('fs')

const config = require('./lib/config')
const info = require('./ci-services')()
const hasLockfileCommit = require('./lib/git-helpers').hasLockfileCommit

const env = process.env

module.exports = function upload () {
  if (!info.branchName) {
    return console.error('No branch details set, so assuming not a Greenkeeper branch')
  }

  // legacy support
  if (config.branchPrefix === 'greenkeeper/' && info.branchName.startsWith('greenkeeper-')) {
    config.branchPrefix = 'greenkeeper-'
  }

  if (!info.branchName.startsWith(config.branchPrefix)) {
    return console.error(`'${info.branchName}' is not a Greenkeeper branch`)
  }

  const isInitial = info.branchName === (config.branchPrefix + 'initial') ||
    info.branchName === (config.branchPrefix + 'update-all')

  if (isInitial) {
    return console.error('Not running on the initial Greenkeeper branch. Will only run on Greenkeeper branches that update a specific dependency')
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

  if (hasLockfileCommit(info)) {
    return console.error('greenkeeper-lockfile already has a commit on this branch')
  }

  const err = fs.openSync('gk-lockfile-git-push.err', 'w')
  exec(`git push${process.env.GK_LOCK_COMMIT_AMEND ? ` --force-with-lease=${info.branchName}:origin/${info.branchName}` : ''} gk-origin HEAD:${info.branchName}`, {
    stdio: [
      'pipe',
      'pipe',
      err
    ]
  })
}

if (require.main === module) module.exports()
