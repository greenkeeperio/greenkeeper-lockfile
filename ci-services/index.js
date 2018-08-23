'use strict'

const _ = require('lodash')

const tests = require('./tests')

module.exports = () => {
  const service = _.findKey(tests, test => test())

  if (!service) throw new Error('Could not detect a CI Service.')

  return require(`./${service}`)
}
