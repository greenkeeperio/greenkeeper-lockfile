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

afterAll(() => {
  childProcess.execSync.restore()
})

function testFixture (fixtureDirectory, noLog) {
  exec.reset()
  exec.withArgs('git status --porcelain').returns('1')
  exec.withArgs('git config remote.origin.url').returns('git@github.com:greenkeeperio/greenkeeper-lockfile.git')
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('npm5 -v').throws()
  if (!noLog) exec.withArgs(`git show --oneline --name-only origin/greenkeeper/my-dependency-1.0.0...master | grep -E '(package-lock.json|npm-shrinkwrap.json|yarn.lock|shrinkwrap.yaml)'`).throws({status: 1, stdout: '', stderr: ''})

  process.chdir(path.join(__dirname, fixtureDirectory))

  let oldGhToken = false
  if (process.env.GH_TOKEN) {
    oldGhToken = process.env.GH_TOKEN
    delete process.env.GH_TOKEN
  }

  update()

  if (oldGhToken) {
    process.env.GH_TOKEN = oldGhToken
  }

  expect(exec.getCalls().map(call => call.args[0])).toMatchSnapshot()
}

const tests = {
  'monorepo: root package': 'fixtures/root-package',
  'monorepo: root and one sub package': 'fixtures/root-and-one-sub',
  'monorepo: root and two sub package': 'fixtures/root-and-two-sub',
  'monorepo: root and two sub package at different levels': 'fixtures/root-and-two-diff-sub',
  'monorepo: no root and one sub package': 'fixtures/no-root-and-one-sub',
  'monorepo: no root and two sub package': 'fixtures/no-root-and-two-sub',
  'monorepo: no root and two sub package at different levels': 'fixtures/no-root-and-two-diff-sub'
}

for (const name in tests) {
  test(name, () => testFixture(tests[name]))
}

// special case
test('monorepo: no package.json', () => {
  testFixture('fixtures/no-package', true)
})
