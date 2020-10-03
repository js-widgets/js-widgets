const downloadBuilder = require('./downloadBuilder');

describe('downloadBuilder', () => {
  const options = { apiKey: 'foo', apiUrl: 'bar', shortcode: 'lorem' };
  const widget = {
    repositoryUrl: 'https://github.com/user/repoName',
    version: 'v12.33.2',
  };
  it('should defer the download', async () => {
    expect.assertions(1);
    const download = jest.fn();
    const instantiate = () => Promise.resolve({ exports: { download } });
    const manager = {
      get: () => ({ foo: 'bar' }),
      check: () => true,
      instantiate,
    };
    const getTarballUrl = jest.fn().mockResolvedValue('bazinga!');
    await downloadBuilder(manager, getTarballUrl, options)(widget, 'meow');
    expect(download).toHaveBeenCalledWith(
      {
        repositoryUrl: 'https://github.com/user/repoName',
        tarballUrl: 'bazinga!',
        version: 'v12.33.2',
      },
      'meow',
    );
  });
});
