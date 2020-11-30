jest.mock('./remoteCopy', () =>
  jest.fn().mockResolvedValue('/the/local/path.tar.gz'),
);
const fs = require('fs');
jest
  .spyOn(fs, 'copyFile')
  .mockImplementation(jest.fn().mockImplementation((a, b, cb) => cb()));

const remoteCopy = require('./remoteCopy');

const downloadBuilder = require('./downloadBuilder');

describe('downloadBuilder', () => {
  const options = { shortcode: 'lorem', headers: { foo: 'bar' } };
  const widget = {
    tarballUrl:
      'https://github.com/js-widgets/example-widget/archive/v1.1.0.tar.gz',
    version: 'v12.33.2',
  };
  it('should defer the download', async () => {
    expect.assertions(1);
    const getTarballUrl = jest.fn().mockResolvedValue('https://bazinga.com');
    const downloader = await downloadBuilder(getTarballUrl, options);
    await downloader(widget, 'meow');
    expect(remoteCopy).toHaveBeenCalledWith(
      'https://bazinga.com',
      'meow/lorem.tar.gz',
      {
        foo: 'bar',
      },
    );
  });
  it('should skip download on local files', async () => {
    expect.assertions(3);
    jest.clearAllMocks();
    const getTarballUrl = jest
      .fn()
      .mockResolvedValue('/path/to/bazinga.tar.gz');
    const downloader = await downloadBuilder(getTarballUrl, options);
    const output = await downloader(widget, 'meow');
    expect(fs.copyFile).toHaveBeenCalledTimes(1);
    expect(remoteCopy).not.toHaveBeenCalled();
    expect(output).toBe('meow/lorem.tar.gz');
  });
});
