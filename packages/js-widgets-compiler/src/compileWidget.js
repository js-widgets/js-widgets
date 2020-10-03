const debug = require('debug')('widget:compile');
const decompress = require('decompress');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const findVersions = require('find-versions');
const { inspect } = require('util');

const buildUrl = require('./util/buildUrl');
const rmdirRecursiveSync = require('./util/rmdirRecursiveSync');
const validateWidget = require('./validateWidget');
const negotiatePlugin = require('./ingestion/negotiatePlugin');
const moveWidgetDependencies = require('./moveWidgetDependencies');
const finalizeWidgetObject = require('./finalizeWidgetObject');

const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'widget-definitions-'));

const handleError = (widgetDirectory, shortcode, error) => {
  // Do not include failed widget directory on the build folder.
  rmdirRecursiveSync(widgetDirectory);
  // Notify error with current widget.
  debug(
    `\x1b[31m[error] - [${shortcode}]\x1b[0m Error while processing widget: ${inspect(
      error,
      { colors: true, depth: 5 },
    )}`,
  );
  return { shortcode: shortcode, failed: true };
};

module.exports = (remoteRegistryUrl, distDir, options) => async (widget) => {
  const { shortcode } = widget;
  const version = findVersions(widget.version)[0];
  const widgetMajorVersion = `v${version.split('.')[0]}`;
  const widgetDirectory = path.join(distDir, shortcode, widgetMajorVersion);
  // Ensure the widget directory under dist exists.
  if (!fs.existsSync(widgetDirectory)) {
    fs.mkdirSync(widgetDirectory, { recursive: true });
  }
  try {
    if (!validateWidget(widget)) {
      return handleError(
        widgetDirectory,
        shortcode,
        new Error('Invalid entry for a widget in the registry. Skipping.'),
      );
    }
    // Determine the absolute URL for the widget directory on the COS bucket.
    const directoryUrl = buildUrl(
      remoteRegistryUrl.origin,
      options.storage.remote.origin.registryPath,
      shortcode,
      widgetMajorVersion,
    );
    // This is forces all the widgets to be served from the same location as the widget registry. This is to improve front
    // end performance with preconnect and dns-prefetch.
    widget.directoryUrl = directoryUrl.toString();

    // Get the plugin from wherever the plugin creator put it, and download it to disk into tempDir.
    const ingestionPlugin = await negotiatePlugin(
      widget,
      'ingestion',
      options.pluginConfig,
    );
    // Ingestion plugins have a `tarballUrl` and a `download` method.
    const tarballPath = await ingestionPlugin.exports.download(widget, tempDir);

    // Decompress the file and move its contents to the directory
    debug(`[info] - [${shortcode}] Uncompressing release.`);
    const files = await decompress(tarballPath, tempDir);
    debug(`[info] - [${shortcode}] Release was uncompressed.`);
    const tempWidgetDirectory = path.join(tempDir, files[0].path);
    await moveWidgetDependencies(widget, tempWidgetDirectory, widgetDirectory);
    widget = finalizeWidgetObject(widget, tempWidgetDirectory, widgetDirectory);

    // Everything went well for this widget.
    debug(`\x1b[32m[info] - [${shortcode}]\x1b[0m Finished processing widget.`);
    return widget;
  } catch (error) {
    return handleError(widgetDirectory, shortcode, error);
  }
};
