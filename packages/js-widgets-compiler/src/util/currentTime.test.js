const currentTime = require('./currentTime');

describe('currentTime', function () {
  it('creates a time string', () => {
    expect.assertions(1);
    expect(currentTime()).toMatch(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/,
    );
  });
});
