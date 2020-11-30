const debug = require('debug')('widget:compile:finalize');
const { existsSync, readFileSync } = require('fs');

const listFilesSync = require('./util/listFilesSync');

module.exports = (widget, tempWidgetDirectory, widgetDirectory) => {
  const { shortcode } = widget;
  // Generate the list of files available for the widget.
  debug(`[info] - [${shortcode}] Generating list of files.`);
  widget.files = listFilesSync(widgetDirectory);
  // Load widget.json file from widget root directory and merge
  // its contents to widget array.
  debug(`[info] - [${shortcode}] Loading widget.json file.`);
  const widgetFilename = `${tempWidgetDirectory}/widget.json`;
  if (!existsSync(widgetFilename)) {
    throw new Error('File widget.json was not found.');
  }
  const widgetFile = JSON.parse(readFileSync(widgetFilename).toString());
  // Load widget.json file from widget root directory and merge
  // its contents to widget array.
  debug(`[info] - [${shortcode}] Loading widget.json file.`);
  Object.assign(widget, widgetFile);
  const assetManifestFilename = `${tempWidgetDirectory}/build/asset-manifest.json`;
  if (!existsSync(assetManifestFilename)) {
    throw new Error('File build/asset-manifest.json was not found.');
  }
  const assetsManifestAll = JSON.parse(
    readFileSync(assetManifestFilename).toString(),
  );
  // Clean the manifest.
  const assetManifest = {
    files: Object.keys(assetsManifestAll.files)
      .filter(
        (fileKey) =>
          fileKey !== 'service-worker.js' &&
          fileKey !== 'index.html' &&
          !fileKey.match(/.*\.map$/) &&
          !fileKey.match(/.*LICENSE\.txt$/),
      )
      .reduce(
        (carry, k) =>
          Object.assign({}, carry, { [k]: assetsManifestAll.files[k] }),
        {},
      ),
    entrypoints: assetsManifestAll.entrypoints,
  };
  Object.assign(widget, { assetManifest });
  return widget;
};
