const exec = require('child_process').execSync

const semver = require('semver')

const flags = {
  'dependencies': '-S',
  'devDependencies': '-D',
  'optionalDependencies': '-O'
}

module.exports = function updateShrinkwrap (dependency, commitMessage, callback) {
  if (semver.lt(exec('npm --version').toString().trim(), '3.0.0')) {
    // simply update the shrinkwrap
    exec('npm shrinkwrap')
  } else {
    // revert the changes done by greenkeeper
    exec('git revert -n HEAD')
    // unstage the changes
    exec('git reset HEAD')

    const flag = flags[dependency.type]
    const prefix = `--save-prefix="${dependency.prefix}"`

    // manually reinstall the package so the shrinkwrap is updated, too
    exec(`npm install ${flag} ${prefix} ${dependency.name}@${dependency.version}`)
  }

  if (exec('git status --porcelain').toString() !== '') {
    // commit the updated shrinkwrap
    exec('git add npm-shrinkwrap.json')
    exec('git config user.email "support@greenkeeper.io"')
    exec('git config user.name "greenkeeperio[bot]"')
    const updateMessage = 'chore(package): update npm-shrinkwrap.json\n\nhttps://npm.im/greenkeeper-shrinkwrap'
    exec(`git commit -m "${updateMessage}"`)
  }
}
