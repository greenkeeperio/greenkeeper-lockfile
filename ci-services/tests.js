const env = process.env

module.exports = {
  travis: () => env.TRAVIS === 'true',
  circleci: () => env.CIRCLECI === 'true'
}
