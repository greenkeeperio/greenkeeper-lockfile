# greenkeeper-shrinkwrap

> Enabling shrinkwrap support for Greenkeeper

[![Build Status](https://travis-ci.org/greenkeeperio/greenkeeper-shrinkwrap.svg?branch=master)](https://travis-ci.org/greenkeeperio/greenkeeper-shrinkwrap)
[![Dependency Status](https://david-dm.org/greenkeeperio/greenkeeper-shrinkwrap/master.svg)](https://david-dm.org/greenkeeperio/greenkeeper-shrinkwrap/master)
[![devDependency Status](https://david-dm.org/greenkeeperio/greenkeeper-shrinkwrap/master/dev-status.svg)](https://david-dm.org/greenkeeperio/greenkeeper-shrinkwrap/master#info=devDependencies)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![NPM](https://nodei.co/npm/greenkeeper-shrinkwrap.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/greenkeeper-shrinkwrap/)

## Setup

After [enabling Greenkeeper for your repository](https://github.com/greenkeeperio/greenkeeper#getting-started-with-greenkeeper) you can use this package to make it work with shrinkwrapped projects.

1. [Create a GitHub access token with push access to your repository](https://github.com/settings/tokens) and make it available to your CI server's environment as `GH_TOKEN`.

2. Configure your CI server to run `greenkeeper-shrinkwrap` right after it `npm install`ed your dependencies.

  ```yml
  # Travis CI example
  before_script:
    - npm install -g greenkeeper-shrinkwrap
    - greenkeeper-shrinkwrap
  ```

That's it.

### Testing multiple node versions

For example on Travis CI it is common to test multiple node versions and therefor have multiple test runs. In this case you should still update the shrinkwrap file for every build job, but only upload it once.
This is why these two steps are available as individual commands: `greenkeeper-shrinkwrap-update` and `greenkeeper-shrinkwrap-upload`.

```yml
# Travis CI example
node_js:
  - 4
  - 5
before_script:
  - npm install -g greenkeeper-shrinkwrap
  - greenkeeper-shrinkwrap-update
  # This will only run on the node version 4 job
  - if [[ $TRAVIS_JOB_NUMBER = "${TRAVIS_BUILD_NUMBER}.1" ]]; then greenkeeper-shrinkwrap-upload; fi
```

## How does it work

1. This script detects whether it's running on a Greenkeeper created branch
2. If so, it updates the shrinkwrap file with the latest version of the updated dependency
3. It pushes the commit with the updated shrinkwrap file back to the Greenkeeper branch/pull request
