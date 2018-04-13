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
  expect.assertions(2)
  runUpdateInSubdir('fixtures/root-package')
  expect(exec.getCall(5).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.callCount).toEqual(13)
})

test('monorepo: no package.json', () => {
  prepare()
  expect.assertions(1)
  runUpdateInSubdir('fixtures/no-package')
  expect(exec.callCount).toEqual(1)
})

test('monorepo: root and one sub package', () => {
  prepare()
  expect.assertions(3)
  runUpdateInSubdir('fixtures/root-and-one-sub')
  expect(exec.getCall(5).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.getCall(10).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.callCount).toEqual(18)
})

test('monorepo: root and two sub package', () => {
  prepare()
  expect.assertions(4)
  runUpdateInSubdir('fixtures/root-and-two-sub')
  expect(exec.getCall(5).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.getCall(10).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.getCall(15).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.callCount).toEqual(23)
})

test('monorepo: root and two sub package at different levels', () => {
  prepare()
  expect.assertions(4)
  runUpdateInSubdir('fixtures/root-and-two-diff-sub')
  expect(exec.getCall(5).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.getCall(10).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.getCall(15).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.callCount).toEqual(23)
})

test('monorepo: no root and one sub package', () => {
  prepare()
  expect.assertions(2)
  runUpdateInSubdir('fixtures/no-root-and-one-sub')
  expect(exec.getCall(5).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.callCount).toEqual(13)
})

test('monorepo: no root and two sub package', () => {
  prepare()
  expect.assertions(3)
  runUpdateInSubdir('fixtures/no-root-and-two-sub')
  expect(exec.getCall(5).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.getCall(10).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.callCount).toEqual(18)
})

test('monorepo: no root and two sub package at different levels', () => {
  prepare()
  expect.assertions(3)
  runUpdateInSubdir('fixtures/no-root-and-two-diff-sub')
  expect(exec.getCall(5).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.getCall(10).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  expect(exec.callCount).toEqual(18)
})
