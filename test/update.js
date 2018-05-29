'use strict'

const stub = require('sinon').stub
const childProcess = require('child_process')
const exec = stub(childProcess, 'execSync')
const process = require('process')
const path = require('path')

const update = require('../update')

process.env.JENKINS_URL = 'true'
process.env.BUILD_NUMBER = '1'
process.env.GIT_BRANCH = 'fooo/greenkeeper/my-dependency-1.0.0'

const prepare = () => {
  exec.reset()
  exec.withArgs('git status --porcelain').returns('1')
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('npm5 -v').throws()
}

// Partial function for stubbing the complicated command used for finding branch commits
const logPartial = (branchName) => {
  return exec.withArgs(`git log --oneline origin/${branchName}...master | grep 'chore(package): update lockfile'`)
}

// Common `exec` errors that can be thrown
const logResponses = {
  errored: {status: 2},
  noMatch: {status: 1, stdout: '', stderr: ''}
}

// Tip for writing more assertions: console.log(exec.args) shows the list of invocations

afterAll(() => {
  childProcess.execSync.restore()
})

function runUpdateInSubdir (dir) {
  process.chdir(path.join(__dirname, dir))
  update()
}

// Monorepo tests
test('monorepo: root package', () => {
  prepare()
  logPartial('greenkeeper/my-dependency-1.0.0').throws(logResponses.noMatch)
  expect.assertions(2)
  runUpdateInSubdir('fixtures/root-package')
  expect(exec.getCall(11).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.callCount).toEqual(20)
})

test('monorepo: no package.json', () => {
  prepare()
  expect.assertions(1)
  runUpdateInSubdir('fixtures/no-package')
  expect(exec.callCount).toEqual(6)
})

test('monorepo: root and one sub package', () => {
  prepare()
  logPartial('greenkeeper/my-dependency-1.0.0').throws(logResponses.noMatch)
  expect.assertions(3)
  runUpdateInSubdir('fixtures/root-and-one-sub')
  expect(exec.getCall(11).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.getCall(18).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.callCount).toEqual(27)
})

test('monorepo: root and two sub package', () => {
  prepare()
  logPartial('greenkeeper/my-dependency-1.0.0').throws(logResponses.noMatch)
  expect.assertions(4)
  runUpdateInSubdir('fixtures/root-and-two-sub')
  expect(exec.getCall(11).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.getCall(18).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.getCall(25).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.callCount).toEqual(34)
})

test('monorepo: root and two sub package at different levels', () => {
  prepare()
  logPartial('greenkeeper/my-dependency-1.0.0').throws(logResponses.noMatch)
  expect.assertions(4)
  runUpdateInSubdir('fixtures/root-and-two-diff-sub')
  expect(exec.getCall(11).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.getCall(18).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.getCall(25).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.callCount).toEqual(34)
})

test('monorepo: no root and one sub package', () => {
  prepare()
  logPartial('greenkeeper/my-dependency-1.0.0').throws(logResponses.noMatch)
  expect.assertions(2)
  runUpdateInSubdir('fixtures/no-root-and-one-sub')
  expect(exec.getCall(11).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.callCount).toEqual(20)
})

test('monorepo: no root and two sub package', () => {
  prepare()
  logPartial('greenkeeper/my-dependency-1.0.0').throws(logResponses.noMatch)
  expect.assertions(3)
  runUpdateInSubdir('fixtures/no-root-and-two-sub')
  expect(exec.getCall(11).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.getCall(18).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.callCount).toEqual(27)
})

test('monorepo: no root and two sub package at different levels', () => {
  prepare()
  logPartial('greenkeeper/my-dependency-1.0.0').throws(logResponses.noMatch)
  expect.assertions(3)
  runUpdateInSubdir('fixtures/no-root-and-two-diff-sub')
  expect(exec.getCall(11).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.getCall(18).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.callCount).toEqual(27)
})
