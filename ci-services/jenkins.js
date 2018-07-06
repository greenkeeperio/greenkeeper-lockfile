'use strict';

const gitHelpers = require('../lib/git-helpers');

const env = process.env;

// Jenkins reports the branch name and Git URL in a couple of different places depending on use of the new
// pipeline vs. older job types.

const origBranch = env.CHANGE_TARGET || env.CHANGE_BRANCH || env.BRANCH_NAME || env.GIT_BRANCH;

function getGitURL() {
  // CHANGE_URL gives us something like: 'https://github.com/owner/repo/pull/4',
  // here we convert that to 'https://github.com/owner/repo.git'
  if (env.CHANGE_URL) {
    const index = env.CHANGE_URL.indexOf('/pull/');
    if (index != -1) {
      return env.CHANGE_URL.slice(0, index) + '.git';
    }
  }
  // Try falling back to another var or query git's config ourselves
  const gitUrl = env.GIT_URL || gitHelpers.getGitURL();
  if (gitUrl) {
    return gitUrl;
  }

  // fall back to trying url from package.json
  const relative = require('require-relative');
  const pkg = relative('./package.json');
  if (typeof pkg.repository === 'string') {
    return pkg.repository;
  }
  if (typeof pkg.repository.url === 'string') {
    return pkg.repository.url;
  }

  return '';
}

function getRepoSlug() {
  const gitURL = getGitURL();
  if (gitURL) {
    return gitHelpers.getRepoSlug(gitURL);
  }

  console.warn('Failed to extract repoSlug, pushes will probably fail.');
  console.warn('Set repository.url with the repo GitHub url in package.json.');
  return env.CI_REPO_NAME;
}

// Different Jenkins plugins format the branch name differently
const matchesGreenkeeper = origBranch.match(/greenkeeper.*/);
const branchName = matchesGreenkeeper ? matchesGreenkeeper[0] : origBranch;

module.exports = {
  gitUrl: getGitURL(),
  branchName,
  repoSlug: getRepoSlug(),
  correctBuild: true, // assuming this is always the correct build to update the lockfile
  uploadBuild: true // assuming 1 build per branch/PR
}
