const { PluginLoaderBase } = require('plugnplay');

const tarballUrlBuilder = require('./tarballUrlBuilder');
const downloadBuilder = require('./downloadBuilder');

module.exports = class TarballUrlLoader extends PluginLoaderBase {
  /**
   * @inheritDoc
   */
  exportSync(options) {
    // Create connection.
    const descriptor = this.descriptor;
    const tarballUrl = tarballUrlBuilder(descriptor);
    const download = downloadBuilder(tarballUrl, options);
    return { tarballUrl, download };
  }
};
