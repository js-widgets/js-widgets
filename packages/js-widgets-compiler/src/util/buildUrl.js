const { URL } = require('url');

/**
 * Builds a URL object based on the origin and path parts.
 *
 * @param {string} origin
 *   The domain name with the protocol included. Ex: https://www.example.org.
 * @param {string} parts
 *   Each one of the parts of the URL. Ex: ['foo', 'bar/baz', 'lorem/'].
 *
 * @returns {URL}
 *   The URL object.
 */
module.exports = (origin, ...parts) => {
  const pathname = parts
    .map((part) => part.replace(/^\//, '').replace(/\/$/, ''))
    .join('/');
  return new URL(`/${pathname}`, origin);
};
