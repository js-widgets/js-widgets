const { URL } = require('url');
const fs = require('fs');
jest.spyOn(fs, 'existsSync');
jest.spyOn(fs, 'mkdirSync');
jest.mock('decompress');
const decompress = require('decompress');
jest.mock('./util/rmdirRecursiveSync');
jest.mock('./ingestion/negotiatePlugin', () => () =>
  Promise.resolve({
    exports: {
      download: jest.fn().mockResolvedValue('the-tarball-path'),
    },
  }),
);
jest.mock('./moveWidgetDependencies');
const moveWidgetDependencies = require('./moveWidgetDependencies');
jest.mock('./finalizeWidgetObject');
const finalizeWidgetObject = require('./finalizeWidgetObject');

const compileWidget = require('./compileWidget');

describe('compileWidget', () => {
  const remoteRegistryUrl = new URL('https://example.org');
  const distDir = `${__dirname}/../tests/exampleDir1/dist`;
  const options = { storage: { remote: { origin: { registryPath: 'hoot' } } } };
  const widget = {
    version: 'v12.33.2',
    shortcode: 'lorem',
    repositoryUrl: 'foo',
  };
  it('should compile successfully', async () => {
    expect.assertions(2);
    fs.existsSync.mockImplementation(
      (path) => path === `${__dirname}/../tests/exampleDir1/dist/lorem/v12`,
    );
    fs.mkdirSync.mockImplementation();
    decompress.mockImplementation(() =>
      Promise.resolve([
        { path: 'file1' },
        { path: 'file2' },
        { path: 'file3' },
      ]),
    );

    const compiler = compileWidget(remoteRegistryUrl, distDir, options);
    await compiler(widget);
    await compiler({ ...widget, version: 'v9.9.9' });
    expect(moveWidgetDependencies).toHaveBeenCalledTimes(2);
    expect(finalizeWidgetObject).toHaveBeenCalledTimes(2);
  });
  it('should handle invalid widgets', async () => {
    expect.assertions(3);
    fs.existsSync.mockImplementation(
      (path) => path === `${__dirname}/../tests/exampleDir1/dist/lorem/v12`,
    );
    fs.mkdirSync.mockImplementation();
    decompress.mockImplementation(() =>
      Promise.resolve([
        { path: 'file1' },
        { path: 'file2' },
        { path: 'file3' },
      ]),
    );

    const compiler = compileWidget(remoteRegistryUrl, distDir, options);
    const output = await compiler({ version: 'v12.9.9', shortcode: 'foo' });
    expect(output.failed).toBe(true);
    expect(moveWidgetDependencies).not.toHaveBeenCalled();
    expect(finalizeWidgetObject).not.toHaveBeenCalled();
  });
  it('should handle unexpected errors', async () => {
    expect.assertions(3);
    fs.existsSync.mockImplementation(
      (path) => path === `${__dirname}/../tests/exampleDir1/dist/lorem/v12`,
    );
    fs.mkdirSync.mockImplementation();
    decompress.mockImplementation(() => Promise.reject('Foo is the bar.'));

    const compiler = compileWidget(remoteRegistryUrl, distDir, options);
    const output = await compiler({ version: 'v12.9.9', shortcode: 'foo' });
    expect(output.failed).toBe(true);
    expect(moveWidgetDependencies).not.toHaveBeenCalled();
    expect(finalizeWidgetObject).not.toHaveBeenCalled();
  });
});
