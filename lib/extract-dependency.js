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

  return _.find(allDependencies, (dependency) => {
    return branch === branchPrefix + dependency.name + '-' + dependency.version
  })
}
