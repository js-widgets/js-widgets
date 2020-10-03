module.exports = (newRegistry, originalRegistry) =>
  newRegistry.filter((newWidget) => {
    const oldWidget = originalRegistry.find(
      ({ shortcode }) => newWidget.shortcode === shortcode,
    );
    if (!oldWidget) {
      return true;
    }
    return newWidget.version !== oldWidget.version;
  });
