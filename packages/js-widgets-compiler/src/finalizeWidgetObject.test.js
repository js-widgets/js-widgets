const finalizeWidgetObject = require('./finalizeWidgetObject');

describe('finalizeWidgetObject', () => {
  it('should fill in the details', () => {
    expect.assertions(1);
    expect(
      finalizeWidgetObject(
        { shortcode: 'foo' },
        `${__dirname}/../tests/exampleDir1`,
        `${__dirname}/../tests/exampleDir1`,
      ),
    ).toMatchSnapshot();
  });
  it('should fail if no widget.json', () => {
    expect.assertions(2);
    expect(() =>
      finalizeWidgetObject(
        { shortcode: 'foo' },
        'tests',
        `${__dirname}/../tests/exampleDir1`,
      ),
    ).toThrow('File widget.json was not found.');
    expect(() =>
      finalizeWidgetObject(
        { shortcode: 'foo' },
        `${__dirname}/../tests/exampleDir1`,
        '/invalid-dir',
      ),
    ).toThrow("ENOENT: no such file or directory, scandir '/invalid-dir'");
  });
  it('should fail if no asset-manifest.json', () => {
    expect.assertions(1);
    expect(() =>
      finalizeWidgetObject(
        { shortcode: 'foo' },
        `${__dirname}/../tests/mocks/fail1`,
        `${__dirname}/../tests/exampleDir1`,
      ),
    ).toThrow('File build/asset-manifest.json was not found.');
  });
});
