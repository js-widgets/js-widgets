const debug = require('debug')('widget:validate');

const requiredProperties = ['version', 'shortcode', 'repositoryUrl'];

/**
 * Checks if a widget has all the necessary information.
 *
 * @param {Object} widget
 *   The widget POJO.
 *
 * @returns {boolean}
 *   True if the object is valid. False otherwise.
 *
 * @todo: it will be more useful to write a schema for this instead.
 */
module.exports = (widget) => {
  return requiredProperties.reduce((isValid, prop) => {
    if (typeof widget[prop] === 'undefined') {
      debug('The property "%s" is not available in %o', prop, widget);
      return false;
    }
    return isValid;
  }, true);
};
