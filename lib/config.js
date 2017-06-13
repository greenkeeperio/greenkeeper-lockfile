const _ = require('lodash')
const relative = require('require-relative')

const pkg = relative('./package.json')

module.exports = _.defaults(pkg.greenkeeper, {
  branchPrefix: 'greenkeeper/',
  username: 'greenkeeper[bot]',
  email: 'support@greenkeeper.io',
  updateMessage: 'chore(package): update lockfile\n\nhttps://npm.im/greenkeeper-lockfile'
})
