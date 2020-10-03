const axios = require('axios');
const debug = require('debug')('widget:registry');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const Ajv = require('ajv');

const compileWidget = require('./compileWidget');
const buildUrl = require('./util/buildUrl');
const registrySchema = require('../registrySchema.json');
const filterUnchangedWidgets = require('./util/filterUnchangedWidgets');

module.exports = async (options) => {
  const { rootDir, onlyCompileChanged } = options;
  const remoteRegistryUrl = buildUrl(
    options.storage.remote.origin.baseUrl,
    options.storage.remote.origin.registryPath,
    'registry.json',
  );
  const url = remoteRegistryUrl.toString();
  let originalRegistry = [];
  const registryData = await promisify(fs.readFile)(
    path.resolve(
      path.format({
        dir: path.join(rootDir, 'metadata'),
        base: 'registry.json',
      }),
    ),
  );
  const manifesto = JSON.parse(registryData);
  // Retrieve current registry version.
  // The original registry information will be used at the end of
  // the script to keep unaltered the information of a widget which
  // failed on the download, uncompress and compilation process.
  try {
    debug('\x1b[34m[debug]\x1b[0m downloading existing registry from: %s', url);
    const response = await axios.get(url);
    originalRegistry = response.data;
  } catch (error) {
    if (error.response.status !== 404) {
      throw new Error(
        `Error while retrieving current registry version: ${error}`,
      );
    } else {
      debug(
        '\x1b[33m[warning]\x1b[0m original registry not found. Starting the registry from scratch.',
      );
    }
  }

  const distDir = path.join(
    rootDir,
    options.storage.filesystem.destination.directory,
  );
  // Iterate over all changed widgets to generate the directory url. Store a list of requests done via promises.
  const candidates = onlyCompileChanged
    ? filterUnchangedWidgets(manifesto, originalRegistry)
    : manifesto;
  // Unchanged widgets will still go into the newly generated registry.json. However, any dropped widgets
  // should be removed.
  const unchangedWidgets = originalRegistry.filter((ow) => {
    return (
      // We want to keep them because they are in the manifesto.
      manifesto.find((nw) => nw.shortcode === ow.shortcode) &&
      // There are no changes to promote.
      !candidates.find((nw) => nw.shortcode === ow.shortcode)
    );
  });
  debug(
    '\x1b[34m[debug]\x1b[0m compiling widgets: %s',
    candidates.map((w) => `${w.shortcode} (${w.version})`).join(', '),
  );
  debug(
    '\x1b[34m[debug]\x1b[0m skipping unchanged widgets: %s',
    unchangedWidgets.map((w) => `${w.shortcode} (${w.version})`).join(', '),
  );
  const compiler = compileWidget(remoteRegistryUrl, distDir, options);
  const requests = candidates.map(compiler);

  // Wait until requests for all repositories have finished.
  const compiledWidgets = await Promise.all(requests);
  const successWidgets = compiledWidgets.filter(({ failed }) => !failed);
  const failWidgets = compiledWidgets.filter(({ failed }) => failed);
  const recoveredWidgets = failWidgets
    .map(({ shortcode }) =>
      originalRegistry.find((original) => original.shortcode === shortcode),
    )
    .filter((w) => w);
  const combinedRegistry = [
    ...unchangedWidgets,
    ...successWidgets,
    ...recoveredWidgets,
  ];
  // Validate that the registry is valid.
  const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
  const validate = ajv.compile(registrySchema);
  const isValid = validate(combinedRegistry);
  if (!isValid) {
    debug(
      '\x1b[31m[error]\x1b[0m Error while validating the registry: %o',
      validate.errors,
    );
    debug('\x1b[31m[error]\x1b[0m Invalid registry is: %o', combinedRegistry);
    throw new Error(
      'The compiled widget registry did not pass schema validation.',
    );
  }
  // Write the registry file to filesystem with the applied changes.
  const distRegistryFilename = path.format({
    dir: distDir,
    base: 'registry.json',
  });
  await promisify(fs.writeFile)(
    distRegistryFilename,
    JSON.stringify(combinedRegistry, null, 2),
  );
  return 'All widgets processed. \x1b[32m✓\x1b[0m';
};
