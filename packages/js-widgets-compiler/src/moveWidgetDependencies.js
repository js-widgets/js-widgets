const debug = require('debug')('widget:compile:move-dependencies');
const { rename } = require('fs');
const { join: joinPath } = require('path');
const { promisify } = require('util');

const runCommand = require('./util/runCommand');
const renameFile = promisify(rename);

const renameIfExists = async (origin, destination) => {
  try {
    await renameFile(origin, destination);
  } catch (error) {
    // Intentionally left blank.
  }
};

module.exports = async (widget, origin, destination) => {
  const { shortcode } = widget;
  const packageManagerName = 'npm';
  debug(
    `[info] - [${shortcode}] Installing dependencies including devDependencies.`,
  );
  await runCommand('nvm use', [], {
    cwd: origin,
    scope: shortcode,
    successMessage:
      "Checking for .nvmrc file. Switching to widget's configured Node version if found.",
  });
  await runCommand(packageManagerName, ['install', '--also', 'dev'], {
    cwd: origin,
    scope: shortcode,
    successMessage: 'All dependencies were successfully installed.',
  });
  await runCommand(packageManagerName, ['run', 'build'], {
    cwd: origin,
    env: { ...process.env, PUBLIC_URL: widget.directoryUrl },
    scope: shortcode,
    successMessage: 'Widget was successfully compiled.',
  });
  return Promise.all([
    // Copy JS files to compiled widget directory.
    renameIfExists(
      joinPath(origin, 'build', 'js'),
      joinPath(destination, 'js'),
    ),
    // If the widget has a thumbnail.svg file, include it on the build.
    renameIfExists(
      joinPath(origin, 'thumbnail.svg'),
      joinPath(destination, 'thumbnail.svg'),
    ),
    // Copy media files to compiled widget directory.
    renameIfExists(
      joinPath(origin, 'build', 'media'),
      joinPath(destination, 'media'),
    ),
    // Copy CSS files to compiled widget directory.
    renameIfExists(
      joinPath(origin, 'build', 'css'),
      joinPath(destination, 'css'),
    ),
  ]);
};
