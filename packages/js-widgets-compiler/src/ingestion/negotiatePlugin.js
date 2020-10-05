const { PluginManager } = require('plugnplay');

/**
 * Creates a plugin instance for ingestion of the release.
 *
 * @param {Object} widgetMeta
 *   The metadata provided in the registry.json for this widget.
 * @param {string} supportedPluginType
 *   The plugin type to use.
 * @param {Object} pluginOptions
 *   The options to pass to the instance.
 *
 * @returns {Promise<PluginInstance>}
 *   A plugin instantiated with the provided options and the ones in the configuration file.
 */
module.exports = async (widgetMeta, supportedPluginType, pluginOptions) => {
  const manager = new PluginManager(pluginOptions.managerOptions || {});
  const plugins = await manager.discover();
  let ingestionPluginDefinition;
  plugins.forEach((descriptor) => {
    // Only consider typed plugins of 'ingestion' type that have a urlKey defined.
    if (
      typeof descriptor.type === 'undefined' ||
      descriptor.type !== supportedPluginType ||
      typeof descriptor.urlKey === 'undefined'
    ) {
      return;
    }
    // If the current widget has this url key defined, then use this ingestion method.
    if (typeof widgetMeta[descriptor.urlKey] !== 'undefined') {
      ingestionPluginDefinition = descriptor;
    }
  });
  if (!ingestionPluginDefinition) {
    throw new Error(
      'Unable to find an ingestion plugin for the widget metadata: ' +
        JSON.stringify(widgetMeta),
    );
  }
  const { id: pluginId } = ingestionPluginDefinition;
  // Now add the plugin configuration to the runtime options.
  let thisPluginConfiguration;
  try {
    thisPluginConfiguration = pluginOptions[supportedPluginType][pluginId];
  } catch (e) {
    thisPluginConfiguration = {};
  }
  const opts = {
    shortcode: widgetMeta.shortcode,
    ...thisPluginConfiguration,
  };
  return manager.instantiate(pluginId, opts);
};
