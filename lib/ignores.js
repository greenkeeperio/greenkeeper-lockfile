const fs = require('fs')
module.exports = function ignores () {
  const ignoreFile = '.gitignore'
  if (!fs.fileExistsSync(ignoreFile)) {
    return []
  }

  const ignoreContents = fs.readFileSync(ignoreFile)
  return ignoreFile.split('\n') || []
}
