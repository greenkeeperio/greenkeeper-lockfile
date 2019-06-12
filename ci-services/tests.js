'use strict'

const env = process.env

module.exports = {
  buildkite: () => env.BUILDKITE === 'true',
  circleci: () => env.CIRCLECI === 'true',
  codebuild: () => env.CODEBUILD_BUILD_ID !== undefined,
  drone: () => env.DRONE === 'true',
  jenkins: () => env.JENKINS_URL !== undefined,
  travis: () => env.TRAVIS === 'true',
  wercker: () => env.WERCKER === 'true',
  codeship: () => env.CI_NAME === 'codeship',
  bitrise: () => env.BITRISE_IO === 'true',
  semaphoreci: () => env.SEMAPHORE === 'true',
  teamcity: () => env.TEAMCITY_VERSION !== undefined,
  appveyor: () => env.APPVEYOR === 'True' || env.APPVEYOR === 'true',
  gitlab: () => env.GITLAB_CI === 'true',
  buddyworks: () => env.BUDDY_EXECUTION_ID !== undefined,
  azure: () => env.TF_BUILD === 'True'
}
