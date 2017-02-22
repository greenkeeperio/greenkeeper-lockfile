#!/usr/bin/env node

const exec = require('child_process').execSync

const _ = require('lodash')
const relative = require('require-relative')

const pkg = relative('./package.json')
const getValuesFromCI = require('./lib/get-values-from-ci')

const env = process.env

module.exports = function upload () {
  if (!env.GH_TOKEN) throw new Error('Please provide a GitHub token as "GH_TOKEN" environment variable')

  const config = pkg.greenkeeper || {}
  const branchPrefix = config.branchPrefix || 'greenkeeper/'

  const ciValues = getValuesFromCI()

  if (_.isEmpty(ciValues)) {
    throw new Error('This script must be run in a supported CI environment')
  }

  const commitMessage = _.get(ciValues, 'commitMessage', '')
  const gitBranchName = _.get(ciValues, 'gitBranchName', '')
  const shouldUpload = _.get(ciValues, 'shouldUpload', false)
  const githubRepoSlug = _.get(ciValues, 'githubRepoSlug', false)

  if (!gitBranchName.startsWith(branchPrefix)) return console.error('Not a Greenkeeper branch.')

  if (gitBranchName === (branchPrefix + 'initial')) return console.error('Not a Greenkeeper update branch.')

  if (/update npm-shrinkwrap\.json/mig.test(commitMessage)) return console.error('Nothing to do, shrinkwrap already updated.')

  if (!shouldUpload) return console.error('Only running on first build job')

  exec(`git remote add gk-origin https://${env.GH_TOKEN}@github.com/${githubRepoSlug}`)
  exec(`git push gk-origin HEAD:${gitBranchName}`)
}

if (require.main === module) module.exports()
