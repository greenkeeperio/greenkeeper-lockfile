'use strict'

const _ = require('lodash')
const relative = require('require-relative')

const pkg = relative('./package.json')

module.exports = _.defaults(pkg.greenkeeper, {
  branchPrefix: 'greenkeeper/'
})
