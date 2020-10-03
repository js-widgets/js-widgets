const filterUnchangedWidgets = require('./filterUnchangedWidgets');

describe('filterUnchangedWidgets', () => {
  it('should filter out unchanged widgets', () => {
    expect.assertions(1);
    const originalRegistry = [
      { shortcode: 'a', version: 'v12.332.3' },
      { shortcode: 'b', version: 'v1.0.0' },
      { shortcode: 'e', version: 'v8.8.8' },
    ];
    const newRegistry = [
      { shortcode: 'a', version: 'v12.332.3' },
      { shortcode: 'b', version: 'v1.0.1' },
      { shortcode: 'c', version: 'v9.9.9' },
    ];
    const changedWidgets = filterUnchangedWidgets(
      newRegistry,
      originalRegistry,
    );
    expect(changedWidgets).toStrictEqual([
      { shortcode: 'b', version: 'v1.0.1' },
      { shortcode: 'c', version: 'v9.9.9' },
    ]);
  });
});
