const debug = require('debug')('widget:compile:ingestion');
const { copyFile: copyFileCb } = require('fs');
const { promisify } = require('util');
const copyFile = promisify(copyFileCb);
const path = require('path');

const remoteCopy = require('./remoteCopy');
const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/;

module.exports = (getTarballUrl, options) =>
  async function (widget, destination) {
    const { headers, shortcode } = options;
    const url = await getTarballUrl(widget);
    debug('[info] - [%s] Ingesting widget from "%s".', shortcode, url);
    const tarballPath = path.format({
      dir: destination,
      name: shortcode,
      ext: '.tar.gz',
    });
    if (!url.match(urlRegex)) {
      // Assume url is a local path.
      await copyFile(url, tarballPath);
      return tarballPath;
    }
    const confirmedTarballPath = await remoteCopy(url, tarballPath, headers);
    debug(
      '[info] - [%s] Release was successfully downloaded to %s.',
      shortcode,
      confirmedTarballPath,
    );
    return confirmedTarballPath;
  };
