'use strict'

const exec = require('child_process').execSync
const semver = require('semver')

const env = process.env

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

module.exports.updateLockfile = function updateLockfile (dependency, options) {
  if (!options.yarn && semver.lt(exec('npm --version').toString().trim(), '3.0.0')) {
    exec('npm shrinkwrap')
  } else {
    if (options.yarn) {
      const flag = yarnFlags[dependency.type]
      const envArgs = env.GK_LOCK_YARN_OPTS ? ` ${env.GK_LOCK_YARN_OPTS.trim()}` : ''
      const args = `${flag}${envArgs} '${dependency.name}@${dependency.range}'`
      exec(`yarn add${args}`)
    }

    if (options.npm) {
      const flag = flags[dependency.type]
      const prefix = dependency.prefix ? ` --save-prefix="${dependency.prefix}"` : ''
      const args = `${flag}${prefix} ${dependency.name}@${dependency.version}`
      let npmBin = 'npm'
      try {
        exec('npm5 -v')
        npmBin = 'npm5'
      } catch (err) {}
      exec(`${npmBin} install${args}`)
    }
  }
}

module.exports.stageLockfile = function stageLockfile (options) {
  // make sure that we have changes to add
  if (exec('git status --porcelain').toString() === '') return

  // stage the updated lockfile
  const ignoreOutput = (options !== undefined && options.ignoreOutput !== undefined) ? options.ignoreOutput : '2>/dev/null || true'
  exec(`git add npm-shrinkwrap.json ${ignoreOutput}`)
  exec(`git add package-lock.json ${ignoreOutput}`)
  exec(`git add yarn.lock ${ignoreOutput}`)
}

module.exports.commitLockfiles = function commitLockfiles () {
  const commitEmail = env.GK_LOCK_COMMIT_EMAIL ? env.GK_LOCK_COMMIT_EMAIL.trim() : 'support@greenkeeper.io'
  const commitName = env.GK_LOCK_COMMIT_NAME ? env.GK_LOCK_COMMIT_NAME.trim() : 'greenkeeperio-bot'
  const shouldAmend = ![undefined, `0`, 'false', 'null', 'undefined'].includes(env.GK_LOCK_COMMIT_AMEND)

  exec(`git config user.email "${commitEmail}"`)
  exec(`git config user.name "${commitName}"`)

  if (shouldAmend) {
    exec(`git commit --amend --author="${commitName} <${commitEmail}>" --no-edit`)
  } else {
    let lockfileWording
    // either say "lockfile" or "lockfiles" depending on how many files are changed
    if (exec('git status --porcelain').toString().split('\n').length > 2) {
      lockfileWording = 'lockfiles'
    } else {
      lockfileWording = 'lockfile'
    }
    const updateMessage = `chore(package): update ${lockfileWording}\n\nhttps://npm.im/greenkeeper-lockfile`
    exec(`git commit -m "${updateMessage}"`)
  }
}
