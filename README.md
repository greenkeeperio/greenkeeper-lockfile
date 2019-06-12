# Greenkeeper Lockfile

## 🆕 🙌 ✨ [Greenkeeper](https://github.com/integration/greenkeeper) now has built-in support for updating lockfiles ✨🙌 🆕

Read all about it here: https://blog.greenkeeper.io/announcing-native-lockfile-support-85381a37a0d0

* * *


>❗ If you have an `npm-shrinkwrap.json` file or are using **private npm packages** you will still need `greenkeeper-lockfile`.

---
![example screenshot](https://cloud.githubusercontent.com/assets/908178/26423274/57c5c774-40cd-11e7-8e01-fc886f23d265.png)

[![Greenkeeper badge](https://badges.greenkeeper.io/greenkeeperio/greenkeeper-lockfile.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/greenkeeperio/greenkeeper-lockfile.svg?branch=master)](https://travis-ci.org/greenkeeperio/greenkeeper-lockfile)
[![Dependency Status](https://david-dm.org/greenkeeperio/greenkeeper-lockfile/master.svg)](https://david-dm.org/greenkeeperio/greenkeeper-lockfile/master)
[![devDependency Status](https://david-dm.org/greenkeeperio/greenkeeper-lockfile/master/dev-status.svg)](https://david-dm.org/greenkeeperio/greenkeeper-lockfile/master#info=devDependencies)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

- [Greenkeeper Lockfile](#greenkeeper-lockfile)
	- [Package Managers](#package-managers)
	- [CI Services](#ci-services)
	- [How does it work](#how-does-it-work)
	- [Setup](#setup)
	- [Using Greenkeeper with Monorepos](#using-greenkeeper-with-monorepos)
	- [Testing multiple node versions](#testing-multiple-node-versions)
	- [CircleCI workflows](#circleci-workflows)
	- [TeamCity Setup](#teamcity-setup)
	- [Configuration options](#configuration-options)
	- [Contributing a CI Service](#contributing-a-ci-service)
		- [Environment information](#environment-information)
		- [Detecting your service](#detecting-your-service)
		- [Testing your service](#testing-your-service)

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
* ✅ Semaphore _Thank you [@cbothner](https://github.com/greenkeeperio/greenkeeper-lockfile/pull/121) 👏_
* ✅ TeamCity _Thank you [@tagoro9](https://github.com/greenkeeperio/greenkeeper-lockfile/pull/131) & [@dbrockman](https://github.com/greenkeeperio/greenkeeper-lockfile/pull/106) 👏_
* ✅ Drone.io _Thank you [@donny-dont](https://github.com/greenkeeperio/greenkeeper-lockfile/pull/141) 👏_
* ✅ AppVeyor _Thank you [@patkub](https://github.com/greenkeeperio/greenkeeper-lockfile/pull/142) 👏_
* ✅ GitLab CI _Thank you [@baer95](https://github.com/greenkeeperio/greenkeeper-lockfile/pull/227) 👏_
* ✅ Azure DevOps CI _Thank you [@asbiin](https://github.com/greenkeeperio/greenkeeper-lockfile/pull/240) 👏_


* 🙏 [Contribute your own](#contributing-a-ci-service)

## How does it work

1. Detect whether the current CI build is caused by Greenkeeper
2. Update the lockfile with the latest version of the updated dependency [using the package manager’s built in mechanism](lib/update-lockfile.js)
3. Push a commit with the updated lockfile back to the Greenkeeper branch

## Setup

1. **[create a GitHub access token with push access to your repository](https://github.com/settings/tokens) and make it available to your CI's environment as `GH_TOKEN`**.
> If you use Travis CI, you may add the token using the [CLI app](https://github.com/travis-ci/travis.rb) as follows: `travis encrypt GH_TOKEN=<token> --add`

2. Configure your CI to use the npm/yarn version you want your lockfiles to be generated with before it installs your dependencies. Install `greenkeeper-lockfile` as well.

3. Configure your CI to run `greenkeeper-lockfile-update` right before it executes your tests and `greenkeeper-lockfile-upload` right after it executed your tests.

_The next Step is only applicable greenkeeper-lockfile version 2 (with monorepo support)_

4. If you use a default branch that is **not** `master` then you have to add the environment variable `GK_LOCK_DEFAULT_BRANCH` with the name of your default branch to your CI.


### Example Travis CI configurations

#### npm

```yml
before_install:
# package-lock.json was introduced in npm@5
- '[[ $(node -v) =~ ^v9.*$ ]] || npm install -g npm@latest' # skipped when using node 9
- npm install -g greenkeeper-lockfile
install: npm install
before_script: greenkeeper-lockfile-update
after_script: greenkeeper-lockfile-upload
```
🚨 **npm ci** won't work with greenkeeper pull requests because:
> If dependencies in the package lock do not match those in package.json, npm ci will exit with an error, instead of updating the package lock.

Travis will use `npm ci` by default if lockfiles are present so you'll need to explicitly tell your CI to run `npm install` instead of `npm ci`

```yml
install: npm install
```

#### yarn

```yml
before_install: yarn global add greenkeeper-lockfile@1
before_script: greenkeeper-lockfile-update
after_script: greenkeeper-lockfile-upload
```

**Custom yarn command line arguments**

To run the lockfile-update script with custom command line arguments, set the `GK_LOCK_YARN_OPTS` environment variable to your needs (set it to `--ignore-engines`, for example). They will be appended to the `yarn add` command.

## Using Greenkeeper with Monorepos

greenkeeper-lockfile 2.0.0 offers support for monorepos. To use it make sure you install `greenkeeper-lockfile@2` explicitly.

If you are using a default branch on Github that is **not** called `master`, please set an Environment Variable `GK_LOCK_DEFAULT_BRANCH` with the name of your default branch in your CI.

## Testing multiple node versions

It is common to test multiple node versions and therefor have multiple test jobs for one build. In this case the lockfile will automatically be updated for every job, but only uploaded for the first one.

```yml
node_js:
  - 6
  - 4
before_install:
- npm install -g npm
- npm install -g greenkeeper-lockfile@1
install: npm install
before_script: greenkeeper-lockfile-update
# Only the node version 6 job will upload the lockfile
after_script: greenkeeper-lockfile-upload
```

## CircleCI workflows

In order to use `greenkeeper-lockfile` with CircleCI workflows, `greenkeeper-lockfile-update` must be run in the first job, while `greenkeeper-lockfile-upload` can be run in any job.
If you want to upload the lockfile in a later job, the `.git` directory needs to be saved to cache after updating, and restored before uploading. ([example workflow config](example-circleci-workflows.md))
Use [sequential job execution](https://circleci.com/docs/2.0/workflows/#sequential-job-execution-example) to ensure the job that runs `greenkeeper-lockfile-update` is always executed first.
For example, if `greenkeeper-lockfile-update` is run in the `lockfile` job, all other jobs in the workflow must require the `lockfile` job to finish before running:

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

## TeamCity Setup

In order for this to work with TeamCity, the build configuration needs to set
the following environment variables:

- VCS_ROOT_URL from the vcsroot.<vcsrootid>.url parameter
- VCS_ROOT_BRANCH from the teamcity.build.branch parameter

## Configuration options

| Environment Variable  | default value | what is it for? |
| ------------- | ------------- | ------------- |
| GK_LOCK_YARN_OPTS  | ''  | Add yarn options that greenkeeper should use e.g. `--ignore-engines`  |
| GK_LOCK_DEFAULT_BRANCH  | 'master'  | Set your default github branch name |
| GK_LOCK_COMMIT_AMEND  | false  | Lockfile commit should be amended to the regular Greenkeeper commit  |
| GK_LOCK_COMMIT_NAME  | 'greenkeeperio-bot'  | Set your prefered git commit name  |
| GK_LOCK_COMMIT_EMAIL  | 'support@greenkeeper.io'  | Set your prefered git commit email  |

## Contributing a CI Service

### Environment information

In order to support a CI service this package needs to extract some information from the environment.

* **repoSlug** The GitHub repo slug e.g. `greenkeeper/greenkeeper-lockfile`
* **branchName** The name of the current branch e.g. `greenkeeper/lodash-4.0.0`
* **firstPush** Is this the first push on this branch i.e. the Greenkeeper commit
* **correctBuild** Is this a regular build (not a pull request for example)
* **uploadBuild** Should the lockfile be uploaded from this build (relevant for testing multiple node versions)

The following optional information may be needed:

* **ignoreOutput** The method to ignore command output when staging the updated lockfile (e.g. `2>NUL || (exit 0)` on Windows)

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
