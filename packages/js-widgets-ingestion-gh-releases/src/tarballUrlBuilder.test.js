const tarballUrlBuilder = require('./tarballUrlBuilder');

describe('tarballUrlBuilder', () => {
  const options = { apiKey: 'foo', apiUrl: 'bar', shortcode: 'lorem' };
  const widget = {
    repositoryUrl: 'https://github.com/user/repoName',
    version: 'v12.33.2',
  };
  const gh = {
    getRepo: () => ({
      listReleases: jest.fn().mockResolvedValue({
        data: [{ name: 'v12.33.2', tarball_url: 'bazinga!' }],
      }),
    }),
  };
  it('should compute the tarball URL', async () => {
    expect.assertions(3);
    const tarballUrl = tarballUrlBuilder(gh, options);
    expect(await tarballUrl(widget)).toBe('bazinga!');
    // Do it a second time to test the static cache path.
    expect(await tarballUrl(widget)).toBe('bazinga!');
    await expect(() =>
      tarballUrl({ ...widget, version: 'v9.9.9' }),
    ).rejects.toThrow('Unable to find a release for this version.');
  });
  it('should fail tarball URL with invalid repo', async () => {
    expect.assertions(1);
    const tarballUrl = tarballUrlBuilder(gh, options);
    await expect(() =>
      tarballUrl({ ...widget, repositoryUrl: 'https://github.com' }),
    ).rejects.toThrow('Malformed repository url for lorem widget.');
  });
});
