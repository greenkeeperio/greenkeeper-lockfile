'use strict'

const env = process.env

module.exports = {
  circleci: () => env.CIRCLECI === 'true',
  jenkins: () => env.JENKINS_URL !== undefined,
  travis: () => env.TRAVIS === 'true',
  wercker: () => env.WERCKER === 'true',
  bitrise: () => env.CI === 'true' && env.BITRISE_BUILD_NUMBER !== ''
}
