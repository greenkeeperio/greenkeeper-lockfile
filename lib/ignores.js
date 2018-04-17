const fs = require('fs')
module.exports = function ignores () {
  const ignoreFile = '.gitignore'
  if (!fs.existsSync(ignoreFile)) {
    return []
  }

  const ignoreContents = fs.readFileSync(ignoreFile).toString()
  return (ignoreContents.length && ignoreContents.split('\n')) || []
}
