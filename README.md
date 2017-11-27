# greenkeeper-lockfile

After [enabling Greenkeeper for your repository](https://github.com/integration/greenkeeper) you can use this package to make it work with lockfiles, such as `npm-shrinkwrap.json`, `package-lock.json` or `yarn.lock`.

![example screenshot](https://cloud.githubusercontent.com/assets/908178/26423274/57c5c774-40cd-11e7-8e01-fc886f23d265.png)

[![Greenkeeper badge](https://badges.greenkeeper.io/greenkeeperio/greenkeeper-lockfile.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/greenkeeperio/greenkeeper-lockfile.svg?branch=master)](https://travis-ci.org/greenkeeperio/greenkeeper-lockfile)
[![Dependency Status](https://david-dm.org/greenkeeperio/greenkeeper-lockfile/master.svg)](https://david-dm.org/greenkeeperio/greenkeeper-lockfile/master)
[![devDependency Status](https://david-dm.org/greenkeeperio/greenkeeper-lockfile/master/dev-status.svg)](https://david-dm.org/greenkeeperio/greenkeeper-lockfile/master#info=devDependencies)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Package Managers

* ✅ npm _(including npm5)_
* ✅ yarn

## CI Services

* ✅ Travis CI
* ✅ Circle CI _Thank you [@ethanrubio](https://github.com/greenkeeperio/greenkeeper-lockfile/pull/18) 👏_
* ✅ Jenkins
* ✅ Wercker
* ✅ Bitrise _Thank you [@zetaron](https://github.com/greenkeeperio/greenkeeper-lockfile/pull/56) 👏_
* ✅ Buildkite _Thank you [@justindowning](https://github.com/greenkeeperio/greenkeeper-lockfile/pull/77) 👏_
* ✅ Codeship _Thank you [@selbyk](https://github.com/greenkeeperio/greenkeeper-lockfile/pull/72) 👏_
* 🙏 [Contribute your own](#contributing-a-ci-service)

## How does it work

1. Detect whether the current CI build is caused by Greenkeeper
2. Update the lockfile with the latest version of the updated dependency [using the package manager’s built in mechanism](lib/update-lockfile.js)
3. Push a commit with the updated lockfile back to the Greenkeeper branch

## Setup

**First [create a GitHub access token with push access to your repository](https://github.com/settings/tokens) and make it available to your CI's environment as `GH_TOKEN`**.

If you use Travis CI, you may add the token using the [CLI app](https://github.com/travis-ci/travis.rb) as follows: `travis encrypt GH_TOKEN=<token> --add`

Configure your CI to use the npm/yarn version you want your lockfiles to be generated with before it installs your dependencies. Install `greenkeeper-lockfile` as well.

Configure your CI to run `greenkeeper-lockfile-update` right before it executes your tests and `greenkeeper-lockfile-upload` right after it executed your tests.


This is how it works on Travis CI for the different package managers.

### npm

```yml
before_install:
# package-lock.json was introduced in npm@5
- '[[ $(node -v) =~ ^v9.*$ ]] || npm install -g npm@latest' # skipped when using node 9
- npm install -g greenkeeper-lockfile@1
before_script: greenkeeper-lockfile-update
after_script: greenkeeper-lockfile-upload
```

### yarn

```yml
before_install: yarn global add greenkeeper-lockfile@1
before_script: greenkeeper-lockfile-update
after_script: greenkeeper-lockfile-upload
```

**Custom yarn command line arguments**

To run the lockfile-update script with custom command line arguments, set the `GK_LOCK_YARN_OPTS` environment variable to your needs (set it to `--ignore-engines`, for example). They will be appended to the `yarn add` command.

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

### CircleCI workflows

In order to use `greenkeeper-lockfile` with CircleCI workflows, it must be in the first job run. Use [sequential job execution](https://circleci.com/docs/2.0/workflows/#sequential-job-execution-example) to ensure the job that runs `greenkeeper-lockfile` is always executed first. For example, if `greenkeeper-lockfile` is run in the `lockfile` job, all other jobs in the workflow must require the `lockfile` job to finish before running:

```yml
workflows:
  version: 2
  workflow_name:
    jobs:
      - lockfile
      - job1:
          requires:
            - lockfile
```

## Contributing a CI Service

### Environment information

In order to support a CI service this package needs to extract some information from the environment.

* **repoSlug** The GitHub repo slug e.g. `greenkeeper/greenkeeper-lockfile`
* **branchName** The name of the current branch e.g. `greenkeeper/lodash-4.0.0`
* **firstPush** Is this the first push on this branch i.e. the Greenkeeper commit
* **correctBuild** Is this a regular build (not a pull request for example)
* **uploadBuild** Should the lockfile be uploaded from this build (relevant for testing multiple node versions)

Have a look at our [Travis CI reference implementation](ci-services/travis.js).

### Detecting your service

Write a test that returns whether this package runs in your CI service’s environment and add it to our [ci-services/tests](ci-services/tests.js).

### Testing your service

In order to test this plugin with your own CI service install your fork directly from git.

```diff
+ npm i -g you/greenkeeper-lockfile#my-ci
- npm i -g greenkeeper-lockfile@1
```

**We are looking forward to your contributions 💖 Don’t forget to add your CI service to the list at the top of this file.**
