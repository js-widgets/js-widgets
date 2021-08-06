const fs = require('fs');
jest.spyOn(fs, 'existsSync');
jest.spyOn(fs, 'renameSync');
jest.mock('./util/runCommand');
const runCommand = require('./util/runCommand');
const moveWidgetDependencies = require('./moveWidgetDependencies');

describe('moveWidgetDependencies', () => {
  it('should execute the commands', async () => {
    expect.assertions(1);
    fs.existsSync.mockImplementation(
      (path) => path === 'tests/origin/metadata/js',
    );
    fs.renameSync.mockImplementation();
    await moveWidgetDependencies(
      { shortcode: 'foo' },
      'tests/origin',
      'tests/destination',
      false,
    );
    expect(runCommand).toHaveBeenCalledTimes(2);
  });
});
