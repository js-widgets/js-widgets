const buildUrl = require('./buildUrl');

describe('buildUrl', function () {
  it('builds a URL', () => {
    expect.assertions(1);
    expect(buildUrl('https://foo.bar', 'one', 'two').toString()).toStrictEqual(
      'https://foo.bar/one/two',
    );
  });
});
