# greenkeeper-lockfile

> Enabling lockfile support for Greenkeeper via your own CI

[![Greenkeeper badge](https://badges.greenkeeper.io/greenkeeperio/greenkeeper-lockfile.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/greenkeeperio/greenkeeper-lockfile.svg?branch=master)](https://travis-ci.org/greenkeeperio/greenkeeper-lockfile)
[![Dependency Status](https://david-dm.org/greenkeeperio/greenkeeper-lockfile/master.svg)](https://david-dm.org/greenkeeperio/greenkeeper-lockfile/master)
[![devDependency Status](https://david-dm.org/greenkeeperio/greenkeeper-lockfile/master/dev-status.svg)](https://david-dm.org/greenkeeperio/greenkeeper-lockfile/master#info=devDependencies)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![NPM](https://nodei.co/npm/greenkeeper-lockfile.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/greenkeeper-lockfile/)

## Package Managers

* ✅ npm
* ✅ npm5
* ✅ yarn

## CI Services

* ✅ Travis CI
* 🙏 [Contribute your own](#contributing-a-ci-service)

## Setup

After [enabling Greenkeeper for your repository](https://github.com/integration/greenkeeper) you can use this package to make it work with lockfiles, such as `npm-shrinkwrap.json`, `package-lock.json` or `yarn.lock`.

**First [create a GitHub access token with push access to your repository](https://github.com/settings/tokens) and make it available to your CI's environment as `GH_TOKEN`**.

Configure your CI to use the npm/yarn version you want your lockfiles to be generated with before it installs your dependencies. Install `greenkeeper-lockfile` as well.

Configure your CI to run `greenkeeper-lockfile-update` right before it executes your tests and `greenkeeper-lockfile-upload` right after it executed your tests.


This is how it works on Travis CI for the different package managers.

### npm

```yml
before_install:
# It is advisable to use at least npm@4, as there are a lot of shrinkwrap fixes in there
- npm install -g npm
- npm install -g greenkeeper-lockfile@1
before_script: greenkeeper-lockfile-update
after_script: greenkeeper-lockfile-upload
```

### npm5 (during beta)

```yml
before_install:
- npm i -g npm5
- npm5 i -g greenkeeper-lockfile@1
install: npm5 install
before_script: greenkeeper-lockfile-update
after_script: greenkeeper-lockfile-upload
```

### yarn

```yml
before_install: yarn global add greenkeeper-lockfile@1
before_script: greenkeeper-lockfile-update
after_script: greenkeeper-lockfile-upload
```

## Testing multiple node versions

It is common to test multiple node versions and therefor have multiple test jobs for one build. In this case the lockfile will automatically be updated for every job, but only uploaded for the first one.

```yml
node_js:
  - 6
  - 4
before_install:
- npm install -g npm
- npm install -g greenkeeper-lockfile@1
before_script: greenkeeper-lockfile-update
# Only the node version 6 job will upload the lockfile
after_script: greenkeeper-lockfile-upload
```

## Contributing a CI Service

### Environment information

In order to support a CI service this package needs to extract some information from the environment.

* **repoSlug** The GitHub repo slug e.g. `greenkeeper/greenkeeper-lockfile`
* **branchName** The name of the current branch e.g. `greenkeeper/lodash-4.0.0`
* **commitMessage** The commit message of the last commit on the current branch e.g. `fix(package): update lodash to version 4.0.0`
* **firstPush** Is this the first push on this branch i.e. the Greenkeeper commit
* **correctBuild** Is this a regular build (not a pull request for example)
* **uploadBuild** Should the lockfile be uploaded from this build (relevant for testing multiple node versions)

Have a look at our [Travis CI reference implementation](ci-services/travis.js).

### Detecting your service

Write a test that returns whether this package runs in your CI service’s environment and add it to our [ci-services/tests](ci-services/tests.js).

**We are looking forward to your contributions 💖 Don’t forget to add your CI service to the list at the top if this file.**

## How does it work

1. This script detects whether it's running on a Greenkeeper created branch
2. If so it updates the lockfile with the latest version of the updated dependency
3. It pushes the commit with the updated lockfile back to the Greenkeeper branch/pull request
