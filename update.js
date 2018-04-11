#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')
const process = require('process')

const relative = require('require-relative')
const fg = require('fast-glob')

const config = require('./lib/config')
const extractDependency = require('./lib/extract-dependency')
const { updateLockfile, commitLockfile } = require('./lib/update-lockfile')
const ci = require('./ci-services')

module.exports = function update () {
  const info = ci()

  // legacy support
  if (config.branchPrefix === 'greenkeeper/' && info.branchName.startsWith('greenkeeper-')) {
    config.branchPrefix = 'greenkeeper-'
  }

  if (!info.branchName.startsWith(config.branchPrefix)) {
    return console.error(`'${info.branchName}' is not a Greenkeeper branch`)
  }

  if (!info.firstPush) {
    return console.error('Only running on first push of a new branch')
  }

  if (!info.correctBuild) {
    return console.error('This build should not update the lockfile. It could be a PR, not a branch build.')
  }

  if (!info.branchName) {
    return console.error('No branch details set, so assuming not a Greenkeeper branch')
  }

  const allPackageFiles = fg.sync('./**/package.json')
  const doCommit = allPackageFiles.reduce((didChange, pkgJson) => {
    const lockfilePath = path.dirname(pkgJson)
    const previousDir = process.cwd()
    process.chdir(lockfilePath)

    const pkg = relative('./package.json')

    const shrinkwrapExists = fs.existsSync('./npm-shrinkwrap.json')
    const packageLockExists = fs.existsSync('./package-lock.json')
    const yarnLockExists = fs.existsSync('./yarn.lock')

    if (!(shrinkwrapExists || packageLockExists || yarnLockExists)) {
      console.info(
        `${pkgJson}: Without either an "npm-shrinkwrap.json", "package-lock.json" or "yarn.lock" file present there is no need to run this script`
      )
      process.chdir(previousDir)
      return didChange
    }

    const dependency = extractDependency(pkg, config.branchPrefix, info.branchName)

    if (!dependency) {
      console.error(`${pkgJson}: No dependency changed`)
      process.chdir(previousDir)
      return didChange
    }

    updateLockfile(dependency, {
      yarn: yarnLockExists,
      npm: packageLockExists || shrinkwrapExists
    })
    process.chdir(previousDir)
    return true
  }, false)

  if (doCommit) {
    commitLockfile()
  }

  if (process.env.NODE_ENV && process.env.NODE_ENV !== 'test') {
    console.log('Lockfile updated')
  }
}
if (require.main === module) module.exports()
