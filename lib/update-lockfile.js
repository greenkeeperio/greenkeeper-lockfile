'use strict'

const exec = require('child_process').execSync
const _ = require('lodash')
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

module.exports = function updateLockfile (dependency, options) {
  if (!options.yarn && semver.lt(exec('npm --version').toString().trim(), '3.0.0')) {
    exec('npm shrinkwrap')
  } else {
    // revert and unstage the changes done by greenkeeper
    exec('git revert -n HEAD')
    exec('git reset HEAD')

    if (options.yarn) {
      const flag = yarnFlags[dependency.type]
      const envArgs = process.env.GK_LOCK_YARN_OPTS ? ` ${process.env.GK_LOCK_YARN_OPTS.trim()}` : ''
      const args = `${flag}${envArgs} '${dependency.name}@${dependency.range}'`
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

  const commitEmail = process.env.GK_LOCK_COMMIT_EMAIL ? process.env.GK_LOCK_COMMIT_EMAIL.trim() : 'support@greenkeeper.io'
  const commitName = process.env.GK_LOCK_COMMIT_NAME ? process.env.GK_LOCK_COMMIT_NAME.trim() : 'greenkeeperio-bot'
  const shouldAmend = !_.includes([undefined, `0`, 'false', 'null', 'undefined'], process.env.GK_LOCK_COMMIT_AMEND)

  if (exec('git status --porcelain').toString() === '') return

  // stage the updated lockfile
  const ignoreOutput = options.ignoreOutput ? options.ignoreOutput : '2>/dev/null || true'
  exec(`git add npm-shrinkwrap.json ${ignoreOutput}`)
  exec(`git add package-lock.json ${ignoreOutput}`)
  exec(`git add yarn.lock ${ignoreOutput}`)

  exec(`git config user.email "${commitEmail}"`)
  exec(`git config user.name "${commitName}"`)

  if (shouldAmend) {
    exec(`git commit --amend --author="${commitName} <${commitEmail}>" --no-edit`)
  } else {
    const updateMessage = 'chore(package): update lockfile\n\nhttps://npm.im/greenkeeper-lockfile'
    exec(`git commit -m "${updateMessage}"`)
  }
}
