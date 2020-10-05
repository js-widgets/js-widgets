const plugnplay = require('plugnplay');
const supportedPluginType = 'ingestion';
jest.spyOn(plugnplay, 'PluginManager').mockReturnValue({
  discover: jest
    .fn()
    .mockResolvedValue([
      { type: supportedPluginType, urlKey: 'repositoryUrl' },
    ]),
  instantiate: jest
    .fn()
    .mockResolvedValue({ descriptor: { id: 'ghReleases' } }),
});

const negotiatePlugin = require('./negotiatePlugin');

describe('negotiatePlugin', () => {
  it('should detect the ghReleases plugin', async () => {
    expect.assertions(1);
    const widgetMeta = { repositoryUrl: 'foo' };
    const pluginOptions = {};
    await expect(
      negotiatePlugin(widgetMeta, supportedPluginType, pluginOptions),
    ).resolves.toHaveProperty('descriptor.id', 'ghReleases');
  });
  it('should detect the ghReleases plugin with custom options', async () => {
    expect.assertions(1);
    const widgetMeta = { repositoryUrl: 'foo' };
    const pluginOptions = { ingestion: { ghReleases: { foo: 'bar' } } };
    await expect(
      negotiatePlugin(widgetMeta, supportedPluginType, pluginOptions),
    ).resolves.toHaveProperty('descriptor.id', 'ghReleases');
  });
  it('should fail if no plugin is suitable', async () => {
    expect.assertions(1);
    plugnplay.PluginManager.mockClear();
    jest.spyOn(plugnplay, 'PluginManager').mockReturnValue({
      discover: jest.fn().mockResolvedValue([{ type: 'invalid' }]),
    });
    const widgetMeta = {};
    const pluginOptions = {};
    await expect(
      negotiatePlugin(widgetMeta, supportedPluginType, pluginOptions),
    ).rejects.toThrow(
      'Unable to find an ingestion plugin for the widget metadata:',
    );
  });
});
