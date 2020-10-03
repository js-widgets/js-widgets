module.exports = {
  hooks: {
    'commit-msg': 'commitlint -e $HUSKY_GIT_PARAMS',
    'pre-commit': 'npm run update-badge && lint-staged',
    'pre-push': 'npm test && npm run test-schema',
  },
};
