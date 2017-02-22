#!/usr/bin/env node

const exec = require('child_process').execSync
const fs = require('fs')

const _ = require('lodash')
const relative = require('require-relative')

const extractDependency = require('./lib/extract-dependency')
const updateShrinkwrap = require('./lib/update-shrinkwrap')
const getValuesFromCI = require('./lib/get-values-from-ci')

const pkg = relative('./package.json')

module.exports = function update () {
  try {
    fs.readFileSync('./npm-shrinkwrap.json')
  } catch (e) {
    throw new Error('Without a shrinkwrap file present there is no need to run this script.')
  }

  const ciValues = getValuesFromCI()

  if (_.isEmpty(ciValues)) {
    throw new Error('This script must be run in a supported CI environment')
  }

  const isPullRequest = _.get(ciValues, 'isPullRequest', false)
  const commitMessage = _.get(ciValues, 'commitMessage', '')
  const gitBranchName = _.get(ciValues, 'gitBranchName', '')

  if (isPullRequest) {
    return console.error('This script needs to run in a branch build, not a PR')
  }

  if (/update npm-shrinkwrap\.json/mig.test(commitMessage)) {
    return console.error('Nothing to do, shrinkwrap already updated.')
  }

  try {
    var dependency = extractDependency(pkg, gitBranchName)
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
