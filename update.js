#!/usr/bin/env node

var exec = require('child_process').exec
var fs = require('fs')

var relative = require('require-relative')

var extractDependency = require('./lib/extract-dependency')
var updateShrinkwrap = require('./lib/update-shrinkwrap')

var pkg = relative('./package.json')

module.exports = function (callback) {
  try {
    fs.readFileSync('./npm-shrinkwrap.json')
  } catch (e) {
    console.error('Without a shrinkwrap file present there is no need to run this script.')
    process.exit(1)
  }

  exec('git log -1 --pretty=%B', function (err, commitMessage) {
    if (err) throw err

    if (/shrinkwrap updated/mig.test(commitMessage)) {
      console.error('Nothing to do, shrinkwrap already updated.')
      process.exit(0)
    }

    extractDependency(pkg, function (err, dependency) {
      // these are expected failures
      if (err) {
        console.error(err.message)
        process.exit(0)
      }

      updateShrinkwrap(dependency, commitMessage, function (err) {
        if (err) throw err

        console.log('shrinkwrap file successfully updated')
        callback && callback()
      })
    })
  })
}

if (require.main === module) module.exports()
