const debug = require('debug')('widget:compile:ingestion');

const staticCache = {};

module.exports = (gh, options) => async (widget) => {
  const { shortcode } = options;
  const cid = JSON.stringify(widget);
  if (typeof staticCache[cid] !== 'undefined') {
    return Promise.resolve(staticCache[cid]);
  }
  // Extract the correct repository form widget.repositoryUrl.
  const repoUrl = widget.repositoryUrl.replace(/\/$/g, '').split('/');

  // We assume repository url has the format https://github.com/<repo owner>/<repo name>
  if (typeof repoUrl[3] === 'undefined' || typeof repoUrl[4] === 'undefined') {
    throw new Error(`Malformed repository url for ${shortcode} widget.`);
  }

  // Create repository handler.
  const repo = gh.getRepo(repoUrl[3], repoUrl[4]);

  // For some reason, `repo.getRelease(widget.version)` is not working.
  // It seems to be a bug on the GitHub library.
  const response = await repo.listReleases();
  // Identify the release which matches with widget release.
  const release = response.data.find(({ name }) => name === widget.version);
  if (!release) {
    throw new Error('Unable to find a release for this version.');
  }
  debug(`[info] - [${shortcode}] Found version ${widget.version}.`);
  staticCache[cid] = release.tarball_url;
  return release.tarball_url;
};
