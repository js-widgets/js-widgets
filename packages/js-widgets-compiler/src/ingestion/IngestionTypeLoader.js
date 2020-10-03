const { PluginTypeLoaderBase } = require('plugnplay');

module.exports = class IngestionTypeLoader extends PluginTypeLoaderBase {
  /**
   * @inheritDoc
   */
  definePluginProperties() {
    return ['tarballUrl', 'download'];
  }
};
