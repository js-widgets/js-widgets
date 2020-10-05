const GitHub = require('github-api');
const { PluginLoaderBase } = require('plugnplay');

const tarballUrlBuilder = require('./tarballUrlBuilder');
const downloadBuilder = require('./downloadBuilder');

module.exports = class GitHubReleasesLoader extends PluginLoaderBase {
  /**
   * @inheritDoc
   */
  exportSync(options) {
    // Create connection.
    const manager = this.manager;
    const gh = new GitHub({ token: options.apiKey }, options.apiUrl);
    const tarballUrl = tarballUrlBuilder(gh, options);
    const download = downloadBuilder(manager, tarballUrl, options);
    return { tarballUrl, download };
  }
};
