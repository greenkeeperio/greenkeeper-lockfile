#!/usr/bin/env node

const exec = require('child_process').execSync

const config = require('./lib/config')

const env = process.env

module.exports = function upload () {
  if (!env.GH_TOKEN) {
    throw new Error('Please provide a GitHub token as "GH_TOKEN" environment variable')
  }

  if (!env.TRAVIS_BRANCH.startsWith(config.branchPrefix)) {
    return console.error('Not a Greenkeeper branch')
  }

  if (env.TRAVIS_BRANCH === (config.branchPrefix + 'initial')) {
    return console.error('Not a Greenkeeper update pull request')
  }

  if (env.TRAVIS_COMMIT_RANGE) {
    return console.error('Only running on first push of a new branch')
  }

  if (!env.TRAVIS_JOB_NUMBER.endsWith('.1')) {
    return console.error('Only running on first build job')
  }

  exec(`git remote add gk-origin https://${env.GH_TOKEN}@github.com/${env.TRAVIS_REPO_SLUG}`)
  exec(`git push gk-origin HEAD:${env.TRAVIS_BRANCH}`)
}

if (require.main === module) module.exports()
