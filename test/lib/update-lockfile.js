const test = require('tap').test
const stub = require('sinon').stub
const exec = stub(require('child_process'), 'execSync')

const updateLockfile = require('../../lib/update-lockfile')

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

test('do shrinkwrap for old npm versions', t => {
  prepare()
  t.plan(1)
  exec.withArgs('npm --version').returns('2.0.0')
  updateLockfile({}, {})
  t.ok(exec.secondCall.calledWith('npm shrinkwrap'))
})

test('use yarn', t => {
  prepare()
  t.plan(1)
  exec.withArgs('npm --version').returns('3.0.0')
  updateLockfile(dependency, { yarn: true })
  t.ok(exec.thirdCall.calledWith("yarn add 'my-dependency@1.0.0'"))
})

test('yarn no prefix', t => {
  prepare()
  t.plan(1)
  const tildeDep = Object.assign({}, dependency, {
    prefix: null
  })
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('npm5 -v').throws()
  updateLockfile(tildeDep, { yarn: true })
  t.ok(exec.thirdCall.calledWith("yarn add 'my-dependency@1.0.0'"))
})

test('use yarn with extra arguments from ENV', t => {
  prepare()
  t.plan(1)
  process.env.GK_LOCK_YARN_OPTS = '--ignore-engines'
  exec.withArgs('npm --version').returns('3.0.0')
  updateLockfile(dependency, { yarn: true })
  t.ok(exec.thirdCall.calledWith("yarn add --ignore-engines 'my-dependency@1.0.0'"))
  delete process.env.GK_LOCK_YARN_OPTS
})

test('use npm', t => {
  prepare()
  t.plan(1)
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('npm5 -v').throws()
  updateLockfile(dependency, { npm: true })
  t.ok(exec.getCall(4).calledWith('npm install -S my-dependency@1.0.0'))
})

test('use npm v5', t => {
  prepare()
  t.plan(1)
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('npm5 -v').returns('5.0.0')
  updateLockfile(dependency, { npm: true })
  t.ok(exec.getCall(4).calledWith('npm5 install -S my-dependency@1.0.0'))
})

test('tilde prefix', t => {
  prepare()
  t.plan(2)
  const tildeDep = Object.assign({}, dependency, {
    prefix: '~',
    range: '~1.0.0'
  })
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('npm5 -v').throws()
  updateLockfile(tildeDep, { yarn: true, npm: true })
  t.ok(exec.thirdCall.calledWith("yarn add 'my-dependency@~1.0.0'"))
  t.ok(exec.getCall(4).calledWith('npm install -S --save-prefix="~" my-dependency@1.0.0'))
})

test('no status', t => {
  exec.reset()
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('git status --porcelain').returns('')
  updateLockfile(dependency, { npm: true })
  t.plan(1)
  t.equal(exec.callCount, 6)
})
