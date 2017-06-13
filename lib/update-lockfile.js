const config = require('./config')

const exec = require('child_process').execSync

const semver = require('semver')

const flags = {
  'dependencies': '-S',
  'devDependencies': '-D',
  'optionalDependencies': '-O'
}

const setPrefixYarn = prefix => prefix === '~'
  ? '--tilde'
  : prefix === ''
  ? '--exact'
  : ''

module.exports = function updateLockfile (dependency, options) {
  if (!options.yarn && semver.lt(exec('npm --version').toString().trim(), '3.0.0')) {
    exec('npm shrinkwrap')
  } else {
    // revert and unstage the changes done by greenkeeper
    exec('git revert -n HEAD')
    exec('git reset HEAD')

    // manually reinstall the package so the lockfile is updated
    // ignore -S for yarn since it does not exist as an option
    const flag = options.yarn && dependency.type === 'dependencies'
      ? '' : flags[dependency.type]
    const prefix = options.yarn
      ? setPrefixYarn(dependency.prefix)
      : `--save-prefix="${dependency.prefix}"`

    const args = `${flag} ${prefix} ${dependency.name}@${dependency.version}`

    if (options.yarn) {
      exec(`yarn add ${args}`)
    } else {
      var npmBin = 'npm'
      try {
        exec('npm5 -v')
        npmBin = 'npm5'
      } catch (err) {}

      exec(`${npmBin} install ${args}`)
    }
  }

  if (exec('git status --porcelain').toString() === '') return

  // commit the updated lockfile
  exec('git add npm-shrinkwrap.json 2>/dev/null || true')
  exec('git add package-lock.json 2>/dev/null || true')
  exec('git add yarn.lock 2>/dev/null || true')
  exec(`git config user.email "${config.email}"`)
  exec(`git config user.name "${config.username}"`)
  exec(`git commit -m "${config.updateMessage}"`)
}
