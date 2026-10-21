// Standalone: the first publication keeps the existing version and release history.
module.exports = {
  increment: false,
  git: {
    requireBranch: 'main',
    requireCleanWorkingDir: true,
    requireUpstream: true,
    commit: false,
    tag: false,
    push: false,
  },
  github: false,
  npm: {
    publish: true,
    stage: true,
    skipChecks: false,
    tag: 'latest',
    publishArgs: ['--access', 'public', '--ignore-scripts', '--registry', 'https://registry.npmjs.org'],
  },
};
