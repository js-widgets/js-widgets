const TarballUrlLoader = require('./TarballUrlLoader');

describe('tarballUrlLoader', () => {
  const execLoader = (instantiate) => {
    instantiate = instantiate || jest.fn();
    const loader = new TarballUrlLoader(
      {
        get: () => ({ foo: 'bar' }),
        check: () => true,
        instantiate,
      },
      'tarballUrl',
    );
    const options = { apiKey: 'foo', apiUrl: 'bar', shortcode: 'lorem' };
    return loader.export(options);
  };
  it('should export the expected methods', async () => {
    expect.assertions(2);
    const exported = await execLoader();
    expect(exported).toHaveProperty('download');
    expect(exported).toHaveProperty('tarballUrl');
  });
});
