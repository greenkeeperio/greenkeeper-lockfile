const exec = require('child_process').execSync

const semver = require('semver')

const flags = {
  'dependencies': '-S',
  'devDependencies': '-D',
  'optionalDependencies': '-O'
}

module.exports = function updateShrinkwrap (dependency, commitMessage, callback) {
  if (semver.lt(exec('npm --version').toString().trim(), '3.0.0')) {
    exec('npm shrinkwrap')
  } else {
    // revert the changes done by greenkeeper
    exec('git revert -n HEAD')
    // unstage the changes
    exec('git reset HEAD')

    const flag = flags[dependency.type]
    const prefix = `--save-prefix="${dependency.prefix}"`

    var npmBin = 'npm'
    try {
      exec('npm5 -v')
      npmBin = 'npm5'
    } catch (err) {}

    // manually reinstall the package so the lockfiles are updated
    exec(`${npmBin} install ${flag} ${prefix} ${dependency.name}@${dependency.version}`)
  }

  if (exec('git status --porcelain').toString() !== '') {
    // commit the updated lockfile(s)
    exec('git add npm-shrinkwrap.json || true')
    exec('git add package-lock.json || true')
    exec('git config user.email "support@greenkeeper.io"')
    exec('git config user.name "greenkeeper[bot]"')
    const updateMessage = 'chore(package): update lockfile\n\nhttps://npm.im/greenkeeper-shrinkwrap'
    exec(`git commit -m "${updateMessage}"`)
  }
}
