'use strict'

const env = process.env

const _ = require('lodash')

module.exports = {
  gitUrl: env.GIT_URL,
  branchName: _.drop(_.split(env.GIT_BRANCH, '/')).join('/'),
  correctBuild: true, // assuming pull requests are not build
  uploadBuild: true // assuming 1 build per branch
}
