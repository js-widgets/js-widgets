module.exports = (manager, getTarballUrl, options) => async (
  widget,
  destination,
) => {
  // Use the tarball widget to deal with this.
  const pluginInstance = await manager.instantiate('tarballUrl', options);
  const widgetWithUrl = {
    ...widget,
    tarballUrl: await getTarballUrl(widget),
  };
  return pluginInstance.exports.download(widgetWithUrl, destination);
};
