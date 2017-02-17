const exec = require('child_process').execSync

const semver = require('semver')

const flags = {
  'dependencies': '-S',
  'devDependencies': '-D',
  'optionalDependencies': '-O'
}

module.exports = function updateShrinkwrap (dependency, commitMessage, callback) {
  const updateMessage = commitMessage + '\n\nshrinkwrap updated by https://npm.im/greenkeeper-shrinkwrap'

  if (semver.lt(exec('npm --version').toString().trim(), '3.0.0')) {
    // update the shrinkwrap
    exec('npm shrinkwrap')

    // add it to the greenkeeper commit
    exec('git add npm-shrinkwrap.json')
    exec(`git commit --amend -m "${updateMessage}"`)
    return
  }

  // revert the commit done by greenkeeper
  exec('git reset HEAD^ --hard')

  const flag = flags[dependency.type]
  const prefix = `--save-prefix="${dependency.prefix}"`

  // correctly reinstall the package so the shrinkwrap is updated
  exec(`npm install ${flag} ${prefix} ${dependency.name}@${dependency.version}`)

  // commit again
  exec('git add package.json npm-shrinkwrap.json')
  exec(`git commit -m "${updateMessage}"`)
}
