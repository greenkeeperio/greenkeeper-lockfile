const _ = require('lodash')

// extract updated dependency/version combo from branch name
module.exports = function extractDependency (pkg, branch) {
  const config = pkg.greenkeeper || {}
  const branchPrefix = config.branchPrefix || 'greenkeeper/'

  if (!branch.startsWith(branchPrefix)) throw new Error('Not a Greenkeeper branch.')

  const allDependencyTypes = _.pick(pkg, [
    'dependencies',
    'devDependencies',
    'optionalDependencies'
  ])

  const allDependencies = _.flatten(_.map(allDependencyTypes, (dependencies, type) => {
    return _.map(dependencies, (range, name) => {
      const version = range.replace(/(>|<|\^|~|=)/g, '')
      const prefix = range.replace(version, '')
      return {name, range, type, version, prefix}
    })
  }))

  const dependency = _.find(allDependencies, (dependency) => {
    return branch === branchPrefix + dependency.name + '-' + dependency.version
  })

  if (!dependency) throw new Error('No dependency changed.')

  return dependency
}
