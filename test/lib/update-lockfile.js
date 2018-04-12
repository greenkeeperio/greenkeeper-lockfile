'use strict'

const stub = require('sinon').stub
const childProcess = require('child_process')
const exec = stub(childProcess, 'execSync')

let lockfile = require('../../lib/update-lockfile')
const updateLockfile = lockfile.updateLockfile
const commitLockfile = lockfile.commitLockfile

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

const updateMessage = 'chore(package): update lockfile\n\nhttps://npm.im/greenkeeper-lockfile'

test('do shrinkwrap for old npm versions', () => {
  prepare()
  expect.assertions(1)
  exec.withArgs('npm --version').returns('2.0.0')
  updateLockfile({}, {})
  commitLockfile()
  expect(exec.secondCall.calledWith('npm shrinkwrap')).toBeTruthy()
})

test('use yarn', () => {
  prepare()
  expect.assertions(1)
  exec.withArgs('npm --version').returns('3.0.0')
  updateLockfile(dependency, { yarn: true })
  commitLockfile()
  expect(exec.thirdCall.calledWith("yarn add 'my-dependency@1.0.0'")).toBeTruthy()
})

test('yarn no prefix', () => {
  prepare()
  expect.assertions(1)
  const tildeDep = Object.assign({}, dependency, {
    prefix: null
  })
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('npm5 -v').throws()
  updateLockfile(tildeDep, { yarn: true })
  commitLockfile()
  expect(exec.thirdCall.calledWith("yarn add 'my-dependency@1.0.0'")).toBeTruthy()
})

test('use yarn with extra arguments from ENV', () => {
  prepare()
  expect.assertions(1)
  process.env.GK_LOCK_YARN_OPTS = '--ignore-engines'
  exec.withArgs('npm --version').returns('3.0.0')
  updateLockfile(dependency, { yarn: true })
  commitLockfile()
  expect(exec.thirdCall.calledWith("yarn add --ignore-engines 'my-dependency@1.0.0'")).toBeTruthy()
  delete process.env.GK_LOCK_YARN_OPTS
})

test('use npm', () => {
  prepare()
  expect.assertions(1)
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('npm5 -v').throws()
  updateLockfile(dependency, { npm: true })
  commitLockfile()
  expect(exec.getCall(4).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
})

test('use npm v5', () => {
  prepare()
  expect.assertions(1)
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('npm5 -v').returns('5.0.0')
  updateLockfile(dependency, { npm: true })
  commitLockfile()
  expect(exec.getCall(4).calledWith('npm5 install -S my-dependency@1.0.0')).toBeTruthy()
})

test('default author', () => {
  prepare()
  exec.withArgs('npm --version').returns('3.0.0')
  expect.assertions(2)
  updateLockfile(dependency, { npm: true })
  commitLockfile()
  expect(exec.getCall(9).calledWith('git config user.email "support@greenkeeper.io"')).toBeTruthy()
  expect(exec.getCall(10).calledWith('git config user.name "greenkeeperio-bot"')).toBeTruthy()
})

test('customise author', () => {
  prepare()
  process.env.GK_LOCK_COMMIT_EMAIL = 'testbot@test.de'
  process.env.GK_LOCK_COMMIT_NAME = 'testbot'
  exec.withArgs('npm --version').returns('3.0.0')
  expect.assertions(2)
  updateLockfile(dependency, { npm: true })
  commitLockfile()
  expect(exec.getCall(9).calledWith('git config user.email "testbot@test.de"')).toBeTruthy()
  expect(exec.getCall(10).calledWith('git config user.name "testbot"')).toBeTruthy()
  delete process.env.GK_LOCK_COMMIT_EMAIL
  delete process.env.GK_LOCK_COMMIT_NAME
})

test('tilde prefix', () => {
  prepare()
  expect.assertions(2)
  const tildeDep = Object.assign({}, dependency, {
    prefix: '~',
    range: '~1.0.0'
  })
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('npm5 -v').throws()
  updateLockfile(tildeDep, { yarn: true, npm: true })
  commitLockfile()
  expect(exec.thirdCall.calledWith("yarn add 'my-dependency@~1.0.0'")).toBeTruthy()
  expect(exec.getCall(4).calledWith('npm install -S --save-prefix="~" my-dependency@1.0.0')).toBeTruthy()
})

test('no status', () => {
  exec.reset()
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('git status --porcelain').returns('')
  updateLockfile(dependency, { npm: true })
  commitLockfile()
  expect.assertions(1)
  expect(exec.callCount).toBe(6)
})

test('no GK_LOCK_COMMIT_AMEND', () => {
  prepare()
  expect.assertions(1)
  exec.withArgs('npm --version').returns('3.0.0')
  updateLockfile(dependency, {})
  commitLockfile()
  expect(exec.getCall(9).calledWith(`git commit -m "${updateMessage}"`)).toBeTruthy()
})

test('with truthy GK_LOCK_COMMIT_AMEND', () => {
  const fixtures = ['1', 'true', 'foo']
  expect.assertions(fixtures.length)
  fixtures.forEach((fixture) => {
    prepare()
    process.env.GK_LOCK_COMMIT_AMEND = fixture
    exec.withArgs('npm --version').returns('3.0.0')
    updateLockfile(dependency, {})
    commitLockfile()
    expect(exec.getCall(9).calledWith(`git commit --amend --author="greenkeeperio-bot <support@greenkeeper.io>" --no-edit`)).toBeTruthy()
  })
  delete process.env.GK_LOCK_COMMIT_AMEND
})

test('with truthy GK_LOCK_COMMIT_AMEND and GK_LOCK_COMMIT_NAME/EMAIL', () => {
  const fixtures = ['1', 'true', 'foo']
  expect.assertions(fixtures.length)
  process.env.GK_LOCK_COMMIT_NAME = 'Example Person'
  process.env.GK_LOCK_COMMIT_EMAIL = 'example@website.com'
  fixtures.forEach((fixture) => {
    prepare()
    process.env.GK_LOCK_COMMIT_AMEND = fixture
    exec.withArgs('npm --version').returns('3.0.0')
    updateLockfile(dependency, {})
    commitLockfile()
    expect(exec.getCall(9).calledWith(`git commit --amend --author="Example Person <example@website.com>" --no-edit`)).toBeTruthy()
  })
  delete process.env.GK_LOCK_COMMIT_AMEND
  delete process.env.GK_LOCK_COMMIT_NAME
  delete process.env.GK_LOCK_COMMIT_EMAIL
})

test('with falsy GK_LOCK_COMMIT_AMEND', () => {
  const fixtures = [undefined, '0', 'false', 'null', 'undefined']
  expect.assertions(fixtures.length)
  fixtures.forEach((fixture) => {
    prepare()
    process.env.GK_LOCK_COMMIT_AMEND = fixture
    exec.withArgs('npm --version').returns('3.0.0')
    updateLockfile(dependency, {})
    commitLockfile()
    expect(exec.getCall(9).calledWith(`git commit -m "${updateMessage}"`)).toBeTruthy()
  })
  delete process.env.GK_LOCK_COMMIT_AMEND
})
