#!/usr/bin/env node

var exec = require('child_process').exec

var _ = require('lodash')
var series = require('run-series')
var slug = require('github-slug')

var token = process.env.GH_TOKEN

module.exports = function () {
  if (!token) throw new Error('GitHub token required.')

  series([
    function (callback) {
      slug('./', function (err, slug) {
        if (err) return callback(err)
        exec('git remote set gk-origin https://' + token + '@github.com/' + slug, callback)
      })
    },
    _.partial(exec, 'git config user.email "support@greenkeeper.io"'),
    _.partial(exec, 'git config user.name "greenkeeperio-bot"'),
    _.partial(exec, 'git push gk-origin HEAD --force')
  ], function (err) {
    if (err) throw err

    console.log('shrinkwrap file successfully uploaded')
  })
}

if (require.main === module) module.exports()
