'use strict'

const exec = require('child_process').execSync
const _ = require('lodash')

module.exports.stageLockfiles = function stageLockfiles () {
  // make sure that we have changes to add
  if (exec('git status --porcelain').toString() === '') return

  // stage the updated lockfile
  exec('git add ./**/npm-shrinkwrap.json 2>/dev/null || true')
  exec('git add ./**/package-lock.json 2>/dev/null || true')
  exec('git add ./**/yarn.lock 2>/dev/null || true')
}

module.exports.commitLockfiles = function commitLockfiles () {
  const commitEmail = process.env.GK_LOCK_COMMIT_EMAIL ? process.env.GK_LOCK_COMMIT_EMAIL.trim() : 'support@greenkeeper.io'
  const commitName = process.env.GK_LOCK_COMMIT_NAME ? process.env.GK_LOCK_COMMIT_NAME.trim() : 'greenkeeperio-bot'
  const shouldAmend = !_.includes([undefined, `0`, 'false', 'null', 'undefined'], process.env.GK_LOCK_COMMIT_AMEND)

  exec(`git config user.email "${commitEmail}"`)
  exec(`git config user.name "${commitName}"`)

  if (shouldAmend) {
    exec(`git commit --amend --author="${commitName} <${commitEmail}>" --no-edit`)
  } else {
    let lockfileWording
    // either say "lockfile" or "lockfiles" depending on how many files are changed
    if (exec('git status --porcelain').toString().split('\n').length > 2) {
      lockfileWording = 'lockfiles'
    } else {
      lockfileWording = 'lockfile'
    }
    const updateMessage = `chore(package): update ${lockfileWording}\n\nhttps://npm.im/greenkeeper-lockfile`
    exec(`git commit -m "${updateMessage}"`)
  }
}
