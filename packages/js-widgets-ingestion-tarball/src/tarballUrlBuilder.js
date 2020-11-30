module.exports = (descriptor) => async (widget) => {
  return Promise.resolve(widget[descriptor.urlKey]);
};
