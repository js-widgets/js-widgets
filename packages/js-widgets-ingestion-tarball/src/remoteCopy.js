const axios = require('axios');
const debug = require('debug')('widget:compile:ingestion');
const fs = require('fs');

/**
 * Copies a remote file to a local destination.
 *
 * @param {string} remotePath
 *   The remote URL or local path.
 * @param {string} localDestination
 *   The local path.
 * @param {Object} headers
 *   Additional headers for HTTP requests.
 *
 * @returns {Promise<string>}
 */
module.exports = async (remotePath, localDestination, headers) => {
  const axiosResponse = await axios({
    url: remotePath,
    method: 'GET',
    responseType: 'stream',
    headers,
  });
  debug('[info] - Downloading release "%s".', remotePath);
  const writer = fs.createWriteStream(localDestination);
  axiosResponse.data.pipe(writer);
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
  return localDestination;
};
