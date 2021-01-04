const debug = require('debug')('widget:validate');
const Ajv = require('ajv');

const widgetSchema = {
  type: 'object',
  required: ['version', 'shortcode'],
  additionalProperties: true,
  properties: {
    version: {
      type: 'string',
      pattern: '^v[0-9]+.[0-9]+.[0-9]+$',
    },
    shortcode: {
      type: 'string',
      maxLength: 255,
    },
    status: {
      type: 'string',
      enum: ['stable', 'beta', 'wip', 'deprecated'],
    },
  },
};
const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
const validate = ajv.compile(widgetSchema);

/**
 * Checks if a widget has all the necessary information.
 *
 * @param {Object} widget
 *   The widget POJO.
 *
 * @returns {boolean}
 *   True if the object is valid. False otherwise.
 */
module.exports = (widget) => {
  const isValid = validate(widget);
  if (!isValid) {
    debug(
      '\x1b[31m[error]\x1b[0m Error while validating the widget: %o',
      validate.errors,
    );
    throw new Error('Invalid entry for a widget in the registry. Skipping.');
  }
  return isValid;
};
