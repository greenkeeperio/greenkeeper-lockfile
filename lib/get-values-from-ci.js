const _ = require('lodash')

const integrationImports = [
  require('./ci-integrations/travis-ci'),
  require('./ci-integrations/circle-ci'),
  {test: _.stubTrue, getValues: _.constant(null)}
]

const integrations = _.map(integrationImports, function (integration) {
  return [_.get(integration, 'test', _.stubFalse), _.get(integration, 'getValues', _.noop)]
})

const getValuesFromCI = _.cond(integrations)

module.exports = getValuesFromCI
