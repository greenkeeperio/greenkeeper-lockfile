'use strict'

const stub = require('sinon').stub
const childProcess = require('child_process')
const exec = stub(childProcess, 'execSync')

const lockfile = require('../../lib/update-lockfile')

const prepare = () => {
  exec.reset()
  exec.withArgs('git status --porcelain').returns('1')
}

afterAll(() => {
  childProcess.execSync.restore()
})

test('default author', () => {
  prepare()
  lockfile.commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
})

test('customise author', () => {
  prepare()
  process.env.GK_LOCK_COMMIT_EMAIL = 'testbot@test.de'
  process.env.GK_LOCK_COMMIT_NAME = 'testbot'
  lockfile.commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
  delete process.env.GK_LOCK_COMMIT_EMAIL
  delete process.env.GK_LOCK_COMMIT_NAME
})

test('no status', () => {
  exec.reset()
  exec.withArgs('git status --porcelain').returns('')
  lockfile.stageLockfiles()
  lockfile.commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
})

test('no GK_LOCK_COMMIT_AMEND', () => {
  prepare()
  lockfile.commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
})

test('with truthy GK_LOCK_COMMIT_AMEND', () => {
  prepare()
  process.env.GK_LOCK_COMMIT_AMEND = 'true'
  lockfile.commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
  delete process.env.GK_LOCK_COMMIT_AMEND
})

test('with truthy GK_LOCK_COMMIT_AMEND and GK_LOCK_COMMIT_NAME/EMAIL', () => {
  process.env.GK_LOCK_COMMIT_NAME = 'Example Person'
  prepare()
  process.env.GK_LOCK_COMMIT_AMEND = '1'
  lockfile.commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
  delete process.env.GK_LOCK_COMMIT_AMEND
  delete process.env.GK_LOCK_COMMIT_NAME
  delete process.env.GK_LOCK_COMMIT_EMAIL
})

test('with falsy GK_LOCK_COMMIT_AMEND', () => {
  prepare()
  process.env.GK_LOCK_COMMIT_AMEND = 'false'
  lockfile.commitLockfiles()
  expect(exec.args.map(args => args[0])).toMatchSnapshot()
  delete process.env.GK_LOCK_COMMIT_AMEND
})
