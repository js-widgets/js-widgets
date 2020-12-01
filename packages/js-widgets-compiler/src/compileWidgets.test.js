const axios = require('axios');
const { unlinkSync, readFileSync } = require('fs');

jest.mock('./compileWidget');
const compileWidget = require('./compileWidget');

const compileWidgets = require('./compileWidgets');

describe('compileWidgets', () => {
  let remoteInfo = { baseUrl: 'https://example.org', registryPath: '/widgets' };
  const options = {
    onlyCompileChanged: true,
    storage: {
      remote: {
        origin: remoteInfo,
        destination: remoteInfo,
      },
      filesystem: {
        destination: {
          directory: 'dist',
        },
      },
    },
    rootDir: `${__dirname}/../tests/mocks/success`,
  };
  const addWidgetData = (widget) => ({
    ...widget,
    assetManifest: { files: {} },
    availableTranslations: ['en'],
    directoryUrl: 'https://example.org/lorem',
    files: [],
    repositoryUrl: 'https://example.org/foo',
    title: 'The Foo!',
  });
  it('should compile every widget and write the result', async () => {
    expect.assertions(3);
    const originalRegistry = [
      { shortcode: 'foo', version: 'v1.0.0', repositoryUrl: 'h' },
    ];
    jest.spyOn(axios, 'get');
    axios.get.mockResolvedValue({ data: originalRegistry });
    const mocked = jest
      .fn()
      .mockImplementation((w) => Promise.resolve(addWidgetData(w)));
    compileWidget.mockReturnValue(mocked);
    const message = await compileWidgets({
      ...options,
      onlyCompileChanged: false,
    });
    expect(mocked).toHaveBeenCalledTimes(1);
    expect(message).toBe('All widgets processed. \x1b[32m✓\x1b[0m');
    expect(
      JSON.parse(
        readFileSync(
          `${__dirname}/../tests/mocks/success/dist/registry.json`,
        ).toString(),
      ),
    ).toMatchSnapshot();
    unlinkSync(`${__dirname}/../tests/mocks/success/dist/registry.json`);
  });
  it('should fail if it can retrieve the original registry', async () => {
    expect.assertions(1);
    jest.spyOn(axios, 'get');
    axios.get.mockRejectedValue({ response: { status: 401 } });
    await expect(() => compileWidgets(options)).rejects.toThrow(
      'Error while retrieving current registry version: ',
    );
  });
  it('should filter out unchanged widgets', async () => {
    expect.assertions(1);
    const originalRegistry = [
      addWidgetData({
        shortcode: 'foo',
        version: 'v1.0.1',
        repositoryUrl: 'h',
      }),
    ];
    jest.spyOn(axios, 'get');
    axios.get.mockResolvedValue({ data: originalRegistry });
    const mocked = jest
      .fn()
      .mockImplementation((w) => Promise.resolve(addWidgetData(w)));
    compileWidget.mockReturnValue(mocked);
    await compileWidgets(options);
    expect(mocked).not.toHaveBeenCalled();
  });
  it('should fail if the compiled registry does not match schema', async () => {
    expect.assertions(1);
    const originalRegistry = [
      { shortcode: 'foo', version: 'v1.0.1234', repositoryUrl: 'h' },
    ];
    jest.spyOn(axios, 'get');
    axios.get.mockResolvedValue({ data: originalRegistry });
    compileWidget.mockReturnValue((w) => Promise.resolve(w));
    await expect(() => compileWidgets(options)).rejects.toThrow(
      'The compiled widget registry did not pass schema validation.',
    );
  });
  it('should tolerate a 404 for the original registry', async () => {
    expect.assertions(2);
    jest.spyOn(axios, 'get');
    axios.get.mockRejectedValue({ response: { status: 404 } });
    const mocked = jest
      .fn()
      .mockImplementation((w) => Promise.resolve(addWidgetData(w)));
    compileWidget.mockReturnValue(mocked);
    const message = await compileWidgets(options);
    expect(message).toBe('All widgets processed. \x1b[32m✓\x1b[0m');
    expect(
      JSON.parse(
        readFileSync(
          `${__dirname}/../tests/mocks/success/dist/registry.json`,
        ).toString(),
      ),
    ).toMatchSnapshot();
    unlinkSync(`${__dirname}/../tests/mocks/success/dist/registry.json`);
  });
});
