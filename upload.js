#!/usr/bin/env node

const exec = require('child_process').execSync

const env = process.env

module.exports = function upload () {
  if (!env.TRAVIS_JOB_NUMBER.endsWith('.1')) return console.error('Only running on first build job')

  if (!env.GH_TOKEN) throw new Error('Please provide a GitHub token as "GH_TOKEN" environment variable')

  exec(`git remote add gk-origin https://${env.GH_TOKEN}@github.com/${env.TRAVIS_REPO_SLUG}`)
  exec('git config user.email "support@greenkeeper.io"')
  exec('git config user.name "greenkeeperio[bot]"')
  exec(`git push gk-origin HEAD:${env.TRAVIS_BRANCH} --force`)
}

if (require.main === module) module.exports()
