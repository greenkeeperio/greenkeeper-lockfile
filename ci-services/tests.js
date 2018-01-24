'use strict'

const env = process.env

module.exports = {
  buildkite: () => env.BUILDKITE === 'true',
  circleci: () => env.CIRCLECI === 'true',
  jenkins: () => env.JENKINS_URL !== undefined,
  travis: () => env.TRAVIS === 'true',
  wercker: () => env.WERCKER === 'true',
  codeship: () => env.CI_NAME === 'codeship',
  bitrise: () => env.CI === 'true' && env.BITRISE_BUILD_NUMBER !== undefined
}
