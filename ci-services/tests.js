const env = process.env

module.exports = {
  travis: () => env.TRAVIS === 'true'
}
