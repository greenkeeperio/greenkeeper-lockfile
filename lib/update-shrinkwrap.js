var exec = require('child_process').exec

var _ = require('lodash')
var semver = require('semver')
var series = require('run-series')

module.exports = function (dependency, commitMessage, callback) {
  var updateMessage = commitMessage + '\n\nshrinkwrap updated by https://npm.im/greenkeeper-shrinkwrap'

  series([
    _.partial(exec, 'git reset HEAD^ --hard'),
    _.partial(exec, 'npm install --save ' + dependency.name + '@' + dependency.version),
    function (callback) {
      exec('npm --version', function (err, version) {
        if (err) return callback(err)
        if (semver.gte(version, '3.0.0')) return callback(null)
        exec('npm shrinkwrap', callback)
      })
    },
    _.partial(exec, 'git add {package,npm-shrinkwrap}.json'),
    _.partial(exec, 'git commit -m "' + updateMessage + '"')
  ], callback)
}
