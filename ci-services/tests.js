'use strict'

const env = process.env

module.exports = {
  buildkite: () => env.BUILDKITE === 'true',
  circleci: () => env.CIRCLECI === 'true',
  drone: () => env.DRONE === 'true',
  jenkins: () => env.JENKINS_URL !== undefined,
  travis: () => env.TRAVIS === 'true',
  wercker: () => env.WERCKER === 'true',
  codeship: () => env.CI_NAME === 'codeship',
  bitrise: () => env.BITRISE_IO === 'true',
  semaphoreci: () => env.SEMAPHORE === 'true',
  teamcity: () => env.TEAMCITY_VERSION !== undefined
}
