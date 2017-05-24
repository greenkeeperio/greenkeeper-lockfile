#!/usr/bin/env node

const fs = require('fs')

const relative = require('require-relative')

const config = require('./lib/config')
const extractDependency = require('./lib/extract-dependency')
const updateLockfile = require('./lib/update-lockfile')
const info = require('./ci-services')()

const pkg = relative('./package.json')

module.exports = function update () {
  try {
    var shrinkwrap = fs.readFileSync('./npm-shrinkwrap.json')
  } catch (e) {}
  try {
    var packageLock = fs.readFileSync('./package-lock.json')
  } catch (e) {}
  try {
    var yarnLock = fs.readFileSync('./yarn.lock')
  } catch (e) {}

  if (!(shrinkwrap || packageLock || yarnLock)) {
    return console.error(
      'Without either an "npm-shrinkwrap.json", "package-lock.json" or "yarn.lock" file present there is no need to run this script'
    )
  }

  if (!info.correctBuild) {
    return console.error('This build should not update the lockfile. It could be a PR, not a branch build.')
  }

  if (!info.branchName.startsWith(config.branchPrefix)) {
    return console.error('Not a Greenkeeper branch')
  }

  if (!info.firstPush) {
    return console.error('Only running on first push of a new branch')
  }

  const dependency = extractDependency(pkg, config.branchPrefix, info.branchName)

  if (!dependency) {
    return console.error('No dependency changed')
  }

  updateLockfile(dependency, {
    yarn: !!yarnLock
  })

  console.log('Lockfile updated')
}

if (require.main === module) module.exports()
