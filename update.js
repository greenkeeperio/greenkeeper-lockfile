#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')
const process = require('process')
const exec = require('child_process').execSync

const relative = require('require-relative')
const fg = require('fast-glob')

const config = require('./lib/config')
const getIgnores = require('./lib/ignores')
const extractDependency = require('./lib/extract-dependency')
const hasLockfileCommit = require('./lib/git-helpers').hasLockfileCommit

const lockfile = require('./lib/update-lockfile')
const updateLockfile = lockfile.updateLockfile
const stageLockfile = lockfile.stageLockfile
const commitLockfiles = lockfile.commitLockfiles

const ci = require('./ci-services')

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

  const ignores = getIgnores()
  const allPackageFiles = fg.sync('./**/package.json', {ignore: ignores})

  // make sure that we have a clean working tree
  exec('git stash')
  // exec('git revert -n HEAD')
  // exec('git reset HEAD')
  const doCommit = allPackageFiles.reduce((didChange, pkgJson) => {
    const lockfilePath = path.dirname(pkgJson)
    const previousDir = process.cwd()

    try {
      process.chdir(lockfilePath)
    } catch (error) {
      console.error(`can't chdir into lockfile path ${lockfilePath}`)
      return
    }

    const pkg = relative('./package.json')

    const shrinkwrapExists = fs.existsSync('./npm-shrinkwrap.json')
    const packageLockExists = fs.existsSync('./package-lock.json')
    const yarnLockExists = fs.existsSync('./yarn.lock')
    const pnpmShrinkwrapExists = fs.existsSync('./shrinkwrap.yaml')

    if (!(shrinkwrapExists || packageLockExists || yarnLockExists || pnpmShrinkwrapExists)) {
      console.info(
        `${pkgJson}: Without either an "npm-shrinkwrap.json", "package-lock.json", "yarn.lock" or "shrinkwrap.yaml" file present there is no need to run this script`
      )
      process.chdir(previousDir)
      return didChange
    }

    const dependency = extractDependency(pkg, config.branchPrefix, info.branchName)

    if (!dependency || dependency.length === 0) {
      console.error(`${pkgJson}: No dependency changed`)
      process.chdir(previousDir)
      return didChange
    }

    dependency.forEach(dep => {
      updateLockfile(dep, {
        yarn: yarnLockExists,
        npm: packageLockExists || shrinkwrapExists,
        pnpm: pnpmShrinkwrapExists
      })
    })

    stageLockfile({
      ignoreOutput: info.ignoreOutput
    })
    process.chdir(previousDir)
    return true
  }, false)

  if (doCommit) {
    commitLockfiles()
  }

  if (process.env.NODE_ENV && process.env.NODE_ENV !== 'test') {
    console.log('Lockfiles updated')
  }
}
if (require.main === module) module.exports()
