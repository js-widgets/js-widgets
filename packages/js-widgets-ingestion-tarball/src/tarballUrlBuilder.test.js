const tarballUrlBuilder = require('./tarballUrlBuilder');

describe('tarballUrlBuilder', () => {
  const descriptor = { urlKey: 'tarballUrl' };
  const widget = {
    tarballUrl: 'https://static.example.org/widgetName-v12.33.2.tar.gz',
    version: 'v12.33.2',
  };
  it('should compute the tarball URL', async () => {
    expect.assertions(1);
    const tarballUrl = tarballUrlBuilder(descriptor);
    expect(await tarballUrl(widget)).toBe(
      'https://static.example.org/widgetName-v12.33.2.tar.gz',
    );
  });
});
