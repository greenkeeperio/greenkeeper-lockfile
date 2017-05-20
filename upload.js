#!/usr/bin/env node

const exec = require('child_process').execSync

const config = require('./lib/config')
const info = require('./ci-services')()

const env = process.env

module.exports = function upload () {
  if (!env.GH_TOKEN) {
    throw new Error('Please provide a GitHub token as "GH_TOKEN" environment variable')
  }

  if (!info.branchName.startsWith(config.branchPrefix)) {
    return console.error('Not a Greenkeeper branch')
  }

  if (info.branchName === (config.branchPrefix + 'initial')) {
    return console.error('Not a Greenkeeper update pull request')
  }

  if (!info.firstPush) {
    return console.error('Only running on first push of a new branch')
  }

  if (!info.uploadBuild) {
    return console.error('Only uploading on one build job')
  }

  exec(`git remote add gk-origin https://${env.GH_TOKEN}@github.com/${info.repoSlug}`)
  exec(`git push gk-origin HEAD:${info.branchName}`)
}

if (require.main === module) module.exports()
