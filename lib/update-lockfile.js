'use strict'

const exec = require('child_process').execSync

const semver = require('semver')

const flags = {
  'dependencies': ' -S',
  'devDependencies': ' -D',
  'optionalDependencies': ' -O'
}

const yarnFlags = {
  'dependencies': '',
  'devDependencies': ' -D',
  'optionalDependencies': ' -O'
}

const setPrefixYarn = prefix => prefix === '~'
  ? ' --tilde'
  : prefix === ''
  ? ' --exact'
  : ''

module.exports = function updateLockfile (dependency, options) {
  if (!options.yarn && semver.lt(exec('npm --version').toString().trim(), '3.0.0')) {
    exec('npm shrinkwrap')
  } else {
    // revert and unstage the changes done by greenkeeper
    exec('git revert -n HEAD')
    exec('git reset HEAD')

    if (options.yarn) {
      const flag = yarnFlags[dependency.type]
      const prefix = setPrefixYarn(dependency.prefix)
      const envArgs = process.env.GK_LOCK_YARN_OPTS ? ` ${process.env.GK_LOCK_YARN_OPTS.trim()}` : ''
      const args = `${flag}${prefix}${envArgs} ${dependency.name}@${dependency.version}`
      exec(`yarn add${args}`)
    }

    if (options.npm) {
      const flag = flags[dependency.type]
      const prefix = dependency.prefix ? ` --save-prefix="${dependency.prefix}"` : ''
      const args = `${flag}${prefix} ${dependency.name}@${dependency.version}`
      var npmBin = 'npm'
      try {
        exec('npm5 -v')
        npmBin = 'npm5'
      } catch (err) {}

      exec(`${npmBin} install${args}`)
    }
  }

  if (exec('git status --porcelain').toString() === '') return

  // check if running on Windows
  var isWin = /^win32/.test(process.platform)

  if (isWin) {
    // running on Windows (ex. AppVeyor)
    // Note: (exit 0), the parentheses create a subshell that exits with status 0 (success), instead of exiting the current shell
    exec('git add npm-shrinkwrap.json >NUL || (exit 0)')
    exec('git add package-lock.json >NUL || (exit 0)')
    exec('git add yarn.lock >NUL || (exit 0)')
    exec('git config user.email "support@greenkeeper.io"')
    exec('git config user.name "greenkeeper[bot]"')
    // git commit, if multiple -m options are given, their values are concatenated as separate paragraphs.
    exec('git commit -m "chore(package): update lockfile" -m "https://npm.im/greenkeeper-lockfile"')
  } else {
    // commit the updated lockfile
    exec('git add npm-shrinkwrap.json 2>/dev/null || true')
    exec('git add package-lock.json 2>/dev/null || true')
    exec('git add yarn.lock 2>/dev/null || true')
    exec('git config user.email "support@greenkeeper.io"')
    exec('git config user.name "greenkeeper[bot]"')
    const updateMessage = 'chore(package): update lockfile\n\nhttps://npm.im/greenkeeper-lockfile'
    exec(`git commit -m "${updateMessage}"`)
  }
}
