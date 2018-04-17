'use strict'

const _ = require('lodash')

module.exports = function extractDependency (pkg, branchPrefix, branch) {
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

  // nicked from https://github.com/greenkeeperio/greenkeeper/blob/master/lib/validate-greenkeeper-json.js#L9
  const groupRex = '([a-zA-Z0-9_-]+/)?'

  return _.find(allDependencies, (dependency) => {
    const rex = RegExp(`${branchPrefix}${groupRex}${dependency.name}-${dependency.version}`)
    return rex.test(branch)
  })
}
