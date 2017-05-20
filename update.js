#!/usr/bin/env node

const fs = require('fs')

const relative = require('require-relative')

const config = require('./lib/config')
const extractDependency = require('./lib/extract-dependency')
const updateLockfile = require('./lib/update-lockfile')

const pkg = relative('./package.json')
const env = process.env

module.exports = function update () {
  try {
    var shrinkwrap = fs.readFileSync('./npm-shrinkwrap.json')
  } catch (e) {}
  try {
    var packageLock = fs.readFileSync('./package-lock.json')
  } catch (e) {}

  if (!(shrinkwrap || packageLock)) {
    throw new Error('Without either an npm-shrinkwrap or package-lock file present there is no need to run this script')
  }

  if (env.TRAVIS !== 'true') {
    throw new Error('This script has to run in an Travis CI environment')
  }

  if (env.TRAVIS_PULL_REQUEST !== 'false') {
    return console.error('This script needs to run in a branch build, not a PR')
  }

  if (!env.TRAVIS_BRANCH.startsWith(config.branchPrefix)) {
    return console.error('Not a Greenkeeper branch')
  }

  if (env.TRAVIS_COMMIT_RANGE) {
    return console.error('Only running on first push of a new branch')
  }

  const dependency = extractDependency(pkg, config.branchPrefix, env.TRAVIS_BRANCH)

  if (!dependency) {
    return console.error('No dependency changed')
  }

  updateLockfile(dependency, env.TRAVIS_COMMIT_MESSAGE)

  console.log('Lockfile updated')
}

if (require.main === module) module.exports()
