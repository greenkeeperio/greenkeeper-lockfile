'use strict'

const extract = require('../../lib/extract-dependency')
const pkg = require('../fixtures/lerna-package')

test('deps extraction works', () => {
  const branch = 'greenkeeper/neighbourhoodie-test-package-16.12.0'
  const expected = {
    name: 'neighbourhoodie-test-package',
    prefix: '^',
    range: '^16.12.0',
    type: 'dependencies',
    version: '16.12.0'
  }
  expect(extract(pkg, 'greenkeeper/', branch)).toEqual(expected)
})

test('deps extraction works with group', () => {
  const pkg = require('../fixtures/lerna-package')

  const branch = 'greenkeeper/cli/neighbourhoodie-test-package-16.12.0'
  const expected = {
    name: 'neighbourhoodie-test-package',
    prefix: '^',
    range: '^16.12.0',
    type: 'dependencies',
    version: '16.12.0'
  }
  expect(extract(pkg, 'greenkeeper/', branch)).toEqual(expected)
})

test('deps extraction works with custom branch prefix', () => {
  const branch = 'flubber/cli/neighbourhoodie-test-package-16.12.0'
  const expected = {
    name: 'neighbourhoodie-test-package',
    prefix: '^',
    range: '^16.12.0',
    type: 'dependencies',
    version: '16.12.0'
  }
  expect(extract(pkg, 'flubber/', branch)).toEqual(expected)
})

test('deps extraction fails with version mismatch', () => {
  const branch = 'flubber/cli/neighbourhoodie-test-package-16.13.0'
  expect(extract(pkg, 'greenkeeper/', branch)).toBeFalsy()
})

test('deps extraction fails with wrong branch prefix', () => {
  const branch = 'flubber/cli/neighbourhoodie-test-package-16.13.0'
  expect(extract(pkg, 'greenkeeper/', branch)).toBeFalsy()
})
