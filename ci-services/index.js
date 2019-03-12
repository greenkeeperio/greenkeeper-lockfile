'use strict'

const tests = require('./tests')

module.exports = () => {
  for (const service in tests) {
    const test = tests[service]
    if (test()) return require(`./${service}`)
  }

  throw new Error('Could not detect a CI Service.')
}
