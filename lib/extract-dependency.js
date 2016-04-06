var exec = require('child_process').exec

var _ = require('lodash')

// extract updated dependency/version combo from branch name
module.exports = function (pkg, callback) {
  exec('git rev-parse --abbrev-ref HEAD', function (err, stdout) {
    if (err) throw err

    var branch = stdout.trim()
    var config = pkg.greenkeeper || {}
    var branchPrefix = config.branchPrefix || 'greenkeeper-'

    if (!_.startsWith(branch, branchPrefix)) callback(new Error('Not a Greenkeeper pull request.'))

    var dependency = pkg.dependencies && _(pkg.dependencies)
    .mapValues(function (version, name) {
      return {
        version: version,
        name: name
      }
    })
    .find(function (dependency) {
      return branch === branchPrefix + dependency.name + '-' + dependency.version.replace(/(>|<|\^|~|=)/g, '')
    })

    if (!dependency) callback(new Error('No dependency changed.'))

    callback(null, dependency)
  })
}
