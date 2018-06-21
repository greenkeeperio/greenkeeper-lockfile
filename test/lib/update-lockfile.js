'use strict'

const stub = require('sinon').stub
const childProcess = require('child_process')
const exec = stub(childProcess, 'execSync')

let lockfile = require('../../lib/update-lockfile')
const updateLockfile = lockfile.updateLockfile
const stageLockfile = lockfile.stageLockfile
const commitLockfiles = lockfile.commitLockfiles

const dependency = {
  type: 'dependencies',
  name: 'my-dependency',
  version: '1.0.0',
  prefix: '',
  range: '1.0.0'
}

const prepare = () => {
  exec.reset()
  exec.withArgs('git status --porcelain').returns('1')
}

afterAll(() => {
  childProcess.execSync.restore()
})

test('do shrinkwrap for old npm versions', () => {
  prepare()
  exec.withArgs('npm --version').returns('2.0.0')
  updateLockfile({}, {})
  stageLockfile()
  commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
})

test('use yarn', () => {
  prepare()
  exec.withArgs('npm --version').returns('3.0.0')
  updateLockfile(dependency, { yarn: true })
  stageLockfile()
  commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
})

test('yarn no prefix', () => {
  prepare()
  const tildeDep = Object.assign({}, dependency, {
    prefix: null
  })
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('npm5 -v').throws()
  updateLockfile(tildeDep, { yarn: true })
  stageLockfile()
  commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
})

test('use yarn with extra arguments from ENV', () => {
  prepare()
  process.env.GK_LOCK_YARN_OPTS = '--ignore-engines'
  exec.withArgs('npm --version').returns('3.0.0')
  updateLockfile(dependency, { yarn: true })
  stageLockfile()
  commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
  delete process.env.GK_LOCK_YARN_OPTS
})

test('use npm', () => {
  prepare()
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('npm5 -v').throws()
  updateLockfile(dependency, { npm: true })
  stageLockfile()
  commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
})

test('use npm v5', () => {
  prepare()
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('npm5 -v').returns('5.0.0')
  updateLockfile(dependency, { npm: true })
  stageLockfile()
  commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
})

test('default author', () => {
  prepare()
  exec.withArgs('npm --version').returns('3.0.0')
  updateLockfile(dependency, { npm: true })
  stageLockfile()
  commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
})

test('customise author', () => {
  prepare()
  process.env.GK_LOCK_COMMIT_EMAIL = 'testbot@test.de'
  process.env.GK_LOCK_COMMIT_NAME = 'testbot'
  exec.withArgs('npm --version').returns('3.0.0')
  updateLockfile(dependency, { npm: true })
  stageLockfile()
  commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
  delete process.env.GK_LOCK_COMMIT_EMAIL
  delete process.env.GK_LOCK_COMMIT_NAME
})

test('tilde prefix', () => {
  prepare()
  const tildeDep = Object.assign({}, dependency, {
    prefix: '~',
    range: '~1.0.0'
  })
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('npm5 -v').throws()
  updateLockfile(tildeDep, { yarn: true, npm: true })
  stageLockfile()
  commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
})

test('no status', () => {
  exec.reset()
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('git status --porcelain').returns('')
  updateLockfile(dependency, { npm: true })
  stageLockfile()
  commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
})

test('no GK_LOCK_COMMIT_AMEND', () => {
  prepare()
  exec.withArgs('npm --version').returns('3.0.0')
  updateLockfile(dependency, {})
  stageLockfile()
  commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
})

test('with truthy GK_LOCK_COMMIT_AMEND', () => {
  prepare()
  process.env.GK_LOCK_COMMIT_AMEND = 'true'
  exec.withArgs('npm --version').returns('3.0.0')
  updateLockfile(dependency, {})
  stageLockfile()
  commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
  delete process.env.GK_LOCK_COMMIT_AMEND
})

test('with truthy GK_LOCK_COMMIT_AMEND and GK_LOCK_COMMIT_NAME/EMAIL', () => {
  process.env.GK_LOCK_COMMIT_NAME = 'Example Person'
  prepare()
  process.env.GK_LOCK_COMMIT_AMEND = '1'
  exec.withArgs('npm --version').returns('3.0.0')
  updateLockfile(dependency, {})
  stageLockfile()
  commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
  delete process.env.GK_LOCK_COMMIT_AMEND
  delete process.env.GK_LOCK_COMMIT_NAME
  delete process.env.GK_LOCK_COMMIT_EMAIL
})

test('with falsy GK_LOCK_COMMIT_AMEND', () => {
  prepare()
  process.env.GK_LOCK_COMMIT_AMEND = 'false'
  exec.withArgs('npm --version').returns('3.0.0')
  updateLockfile(dependency, {})
  stageLockfile()
  commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
  delete process.env.GK_LOCK_COMMIT_AMEND
})

test('with truthy ignoreOutput', () => {
  prepare()
  expect.assertions(3)
  exec.withArgs('npm --version').returns('3.0.0')
  const infoIgnoreOutput = '2>/dev/null || true'
  updateLockfile(dependency, {ignoreOutput: infoIgnoreOutput})
  expect(exec.getCall(4).calledWith(`git add npm-shrinkwrap.json ${infoIgnoreOutput}`)).toBeTruthy()
  expect(exec.getCall(5).calledWith(`git add package-lock.json ${infoIgnoreOutput}`)).toBeTruthy()
  expect(exec.getCall(6).calledWith(`git add yarn.lock ${infoIgnoreOutput}`)).toBeTruthy()
})
