const axios = require('axios');
const debug = require('debug')('widget:compile:ingestion');
const fs = require('fs');
const path = require('path');
const { PluginLoaderBase } = require('plugnplay');

module.exports = class TarballUrlLoader extends PluginLoaderBase {
  /**
   * @inheritDoc
   */
  exportSync(options) {
    const descriptor = this.descriptor;
    return {
      tarballUrl: async function (widget) {
        return Promise.resolve(widget[descriptor.urlKey]);
      },
      download: async function (widget, destination) {
        const { headers, shortcode } = options;
        const url = await this.tarballUrl(widget);
        debug('[info] - [%s] Ingesting widget from "%s".', shortcode, url);
        const axiosResponse = await axios({
          url,
          method: 'GET',
          responseType: 'stream',
          headers,
        });
        debug('[info] - [%s] Downloading release', shortcode);
        const tarballPath = path.format({
          dir: destination,
          name: shortcode,
          ext: '.tar.gz',
        });
        const writer = fs.createWriteStream(tarballPath);
        axiosResponse.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        debug(
          '[info] - [%s] Release was successfully downloaded to %s.',
          shortcode,
          tarballPath,
        );
        return tarballPath;
      },
    };
  }
};
