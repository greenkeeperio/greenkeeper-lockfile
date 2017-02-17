#!/usr/bin/env node

const exec = require('child_process').execSync
const fs = require('fs')

const relative = require('require-relative')

const extractDependency = require('./lib/extract-dependency')
const updateShrinkwrap = require('./lib/update-shrinkwrap')

const pkg = relative('./package.json')

const env = process.env

module.exports = function update () {
  try {
    fs.readFileSync('./npm-shrinkwrap.json')
  } catch (e) {
    throw new Error('Without a shrinkwrap file present there is no need to run this script.')
  }

  if (env.TRAVIS !== 'true') {
    throw new Error('This script hast to run in an Travis CI environment')
  }

  if (env.TRAVIS_PULL_REQUEST !== 'false') {
    return console.error('This script needs to run in a branch build, not a PR')
  }

  const commitMessage = env.TRAVIS_COMMIT_MESSAGE

  if (/update npm-shrinkwrap\.json/mig.test(commitMessage)) {
    return console.error('Nothing to do, shrinkwrap already updated.')
  }

  try {
    var dependency = extractDependency(pkg, env.TRAVIS_BRANCH)
  } catch (err) {
    // these are expected failures
    return console.error(err.message)
  }

  exec('git config user.email "support@greenkeeper.io"')
  exec('git config user.name "greenkeeperio[bot]"')

  updateShrinkwrap(dependency, commitMessage)

  console.log('Shrinkwrap file updated')
}

if (require.main === module) module.exports()
