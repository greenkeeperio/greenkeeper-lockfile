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

  const monorepoReleaseRex = RegExp(`${branchPrefix}${groupRex}monorepo.([a-zA-Z0-9_-]+)-([.0-9-]+)`)

  if (monorepoReleaseRex.test(branch)) {
    const monorepoDefinintions = require('greenkeeper-monorepo-definitions')
    const monorepoDefinitionGroupName = branch.match(monorepoReleaseRex)[2]

    if (!monorepoDefinitionGroupName) {
      return console.error('Could not extract the dependency group name from the branch name.')
    }

    const monorepo = monorepoDefinintions[monorepoDefinitionGroupName]
    if (!monorepo) {
      return console.error(`${monorepoDefinitionGroupName} is missing in Greenkeeper's monorepo definitions`)
    }

    const dependencies = allDependencies.filter(dependency => {
      return monorepo.includes(dependency.name)
    })

    return dependencies
  }

  const dependency = _.find(allDependencies, (dependency) => {
    const rex = RegExp(`${branchPrefix}${groupRex}${dependency.name}-${dependency.version}`)
    return rex.test(branch)
  })
  return [dependency]
}
