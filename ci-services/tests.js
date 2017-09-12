'use strict'

const env = process.env

module.exports = {
  buildkite: () => env.BUILDKITE === 'true',
  circleci: () => env.CIRCLECI === 'true',
  jenkins: () => env.JENKINS_URL !== undefined,
  travis: () => env.TRAVIS === 'true',
  wercker: () => env.WERCKER === 'true',
  bitrise: () => env.CI === 'true' && env.BITRISE_BUILD_NUMBER !== undefined,
  codeship: () => env.CI_COMMIT_ID !== undefined
}
