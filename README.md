# greenkeeper-shrinkwrap

> Enabling shrinkwrap support for Greenkeeper via Travis CI

[![Greenkeeper badge](https://badges.greenkeeper.io/greenkeeperio/greenkeeper-shrinkwrap.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/greenkeeperio/greenkeeper-shrinkwrap.svg?branch=master)](https://travis-ci.org/greenkeeperio/greenkeeper-shrinkwrap)
[![Dependency Status](https://david-dm.org/greenkeeperio/greenkeeper-shrinkwrap/master.svg)](https://david-dm.org/greenkeeperio/greenkeeper-shrinkwrap/master)
[![devDependency Status](https://david-dm.org/greenkeeperio/greenkeeper-shrinkwrap/master/dev-status.svg)](https://david-dm.org/greenkeeperio/greenkeeper-shrinkwrap/master#info=devDependencies)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![NPM](https://nodei.co/npm/greenkeeper-shrinkwrap.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/greenkeeper-shrinkwrap/)

## Setup

After [enabling Greenkeeper for your repository](https://github.com/greenkeeperio/greenkeeper#getting-started-with-greenkeeper) you can use this package to make it work with shrinkwrapped projects.

1. [Create a GitHub access token with push access to your repository](https://github.com/settings/tokens) and make it available to Travis CI's environment as `GH_TOKEN`.

1. Configure Travis CI to run `greenkeeper-shrinkwrap-update` right before it `npm install`s your dependencies.

  ```yml
  before_install:
  - npm install -g greenkeeper-shrinkwrap
  - greenkeeper-shrinkwrap-update
  ```

1. Configure Travis CI to run `greenkeeper-shrinkwrap-upload` right after it executed your tests.

  ```yml
  after_script: greenkeeper-shrinkwrap-update
  ```

That's it.

### Testing multiple node versions

It is common to test multiple node versions and therefor have multiple test jobs for one build. In this case the shrinkwrap will automatically be updated for every job, but only uploaded for the first one.

```yml
node_js:
  - 6
  - 4
before_install:
- npm install -g greenkeeper-shrinkwrap
- greenkeeper-shrinkwrap-update
# Only the node version 6 job will upload the shrinkwrap
after_script: greenkeeper-shrinkwrap-upload
```

## How does it work

1. This script detects whether it's running on a Greenkeeper created branch
2. If so it updates the shrinkwrap file with the latest version of the updated dependency
3. It pushes the commit with the updated shrinkwrap file back to the Greenkeeper branch/pull request
