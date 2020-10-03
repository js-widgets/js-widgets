const validateWidget = require('./validateWidget');

describe('validateWidget', () => {
  it('should pass on valid widget', () => {
    expect.assertions(1);
    expect(
      validateWidget({
        version: 'foo',
        shortcode: 'bar',
        repositoryUrl: 'baz',
        extra: 'zab',
      }),
    ).toBe(true);
  });
  it('should fail on invalid widget', () => {
    expect.assertions(6);
    expect(validateWidget({})).toBe(false);
    expect(validateWidget({ version: 'foo' })).toBe(false);
    expect(validateWidget({ shortcode: 'bar' })).toBe(false);
    expect(validateWidget({ repositoryUrl: 'baz' })).toBe(false);
    expect(validateWidget({ version: 'foo', shortcode: 'bar' })).toBe(false);
    expect(validateWidget({ version: 'foo', repositoryUrl: 'baz' })).toBe(
      false,
    );
  });
});
