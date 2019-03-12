'use strict'

const relative = require('require-relative')

const { greenkeeper = {} } = relative('./package.json')

if (typeof greenkeeper.branchPrefix === 'undefined') greenkeeper.branchPrefix = 'greenkeeper/'

module.exports = greenkeeper
