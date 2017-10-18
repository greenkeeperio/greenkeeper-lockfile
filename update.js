#!/usr/bin/env node

'use strict'

const fs = require('fs')

const relative = require('require-relative')

const config = require('./lib/config')
const extractDependency = require('./lib/extract-dependency')
const updateLockfile = require('./lib/update-lockfile')
const info = require('./ci-services')()

const pkg = relative('./package.json')

module.exports = function update () {
  const shrinkwrapExists = fs.existsSync('./npm-shrinkwrap.json')
  const packageLockExists = fs.existsSync('./package-lock.json')
  const yarnLockExists = fs.existsSync('./yarn.lock')

  if (!(shrinkwrapExists || packageLockExists || yarnLockExists)) {
    return console.error(
      'Without either an "npm-shrinkwrap.json", "package-lock.json" or "yarn.lock" file present there is no need to run this script'
    )
  }

  if (!info.correctBuild) {
    return console.error('This build should not update the lockfile. It could be a PR, not a branch build.')
  }

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

  if (!info.firstPush) {
    return console.error('Only running on first push of a new branch')
  }

  const dependency = extractDependency(pkg, config.branchPrefix, info.branchName)

  if (!dependency) {
    return console.error('No dependency changed')
  }

  updateLockfile(dependency, {
    yarn: yarnLockExists,
    npm: packageLockExists || shrinkwrapExists
  })

  console.log('Lockfile updated')
}

if (require.main === module) module.exports()
