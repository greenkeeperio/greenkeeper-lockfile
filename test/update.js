const stub = require('sinon').stub
const exec = stub(require('child_process'), 'execSync')
const process = require('process')

const update = require('../update')

process.env.TRAVIS = 'true'
process.env.TRAVIS_JOB_NUMBER = '1'
process.env.TRAVIS_PULL_REQUEST = 'false'
process.env.TRAVIS_BRANCH = 'greenkeeper/my-dependency-1.0.0'

const prepare = () => {
  exec.reset()
  exec.withArgs('git status --porcelain').returns('1')
  exec.withArgs('npm --version').returns('3.0.0')
  exec.withArgs('npm5 -v').throws()
}

// Monorepo tests
test('monorepo: root package', () => {
  prepare()
  expect.assertions(1)
  process.chdir('test/fixtures/root-package')
  try { update() } catch (e) { console.log(e) }
  /*
    [ 'npm --version' ],
    [ 'git revert -n HEAD' ],
    [ 'git reset HEAD' ],
    [ 'npm5 -v' ],
    [ 'npm5 install -S my-dependency@1.0.0' ],
    [ 'git status --porcelain' ],
    [ 'git add npm-shrinkwrap.json 2>/dev/null || true' ],
    [ 'git add package-lock.json 2>/dev/null || true' ],
    [ 'git add yarn.lock 2>/dev/null || true' ],
    [ 'git config user.email "support@greenkeeper.io"' ],
    [ 'git config user.name "greenkeeperio-bot"' ],
    [ 'git commit -m "chore(package): update lockfile\n\nhttps://npm.im/greenkeeper-lockfile"' ] ],
  */
  expect(exec.getCall(4).calledWith('npm install -S my-dependency@1.0.0')).toBeTruthy()
  process.chdir('../../../')
})

test('monorepo: no package.json', () => {
  prepare()
  expect.assertions(1)
  process.chdir('test/fixtures/no-package')
  try {
    update()
  } catch (e) {
    expect(e.message).toEqual('Cannot find module \'./package.json\'')
  }
  process.chdir('../../../')
})

/*

test plan for monorepo:
  create fixture repos with different configurations, for both npm and yarn and their lockfiles
  - no package.json
  - no package-lock.json
  - [x] root package.json
  - root package.json and one subdir package.json
  - root package.json and two subdir package.json
  - root package.json and two subdir package.json with different subdir levels
  - no root package.json and one subdir package.json
  - no root package.json and two subdir package.json
  - no root package.json and two subdir package.json with different subdir levels

implementation plan:

use fast-glob to find all package.json files
then loop over existing logic, but silently fail if it has no companion yarn lock

*/
