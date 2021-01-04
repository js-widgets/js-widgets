const validateWidget = require('./validateWidget');

describe('validateWidget', () => {
  it('should pass on valid widget', () => {
    expect.assertions(2);
    expect(
      validateWidget({
        version: 'v1.1222.0',
        shortcode: 'bar',
        extra: 'zab',
      }),
    ).toBe(true);
    expect(
      validateWidget({
        version: 'v1.1222.0',
        shortcode: 'bar',
        extra: 'zab',
        status: 'deprecated',
      }),
    ).toBe(true);
  });
  it('should fail on invalid widget', () => {
    expect.assertions(6);
    const message = 'Invalid entry for a widget in the registry. Skipping.';
    expect(() => validateWidget({})).toThrow(message);
    expect(() => validateWidget({ version: 'foo' })).toThrow(message);
    expect(() => validateWidget({ shortcode: 'bar' })).toThrow(message);
    expect(() => validateWidget({ repositoryUrl: 'baz' })).toThrow(message);
    expect(() => validateWidget({ version: 'foo', shortcode: 'bar' })).toThrow(
      message,
    );
    expect(() =>
      validateWidget({
        version: 'v1.1222.0',
        shortcode: 'bar',
        extra: 'zab',
        status: 'meow',
      }),
    ).toThrow(message);
  });
});
