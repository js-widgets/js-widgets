const os = require('os');

const runCommand = require('./runCommand');

describe('runCommand', () => {
  it('executes the file command', async () => {
    expect.assertions(3);
    await Promise.all([
      expect(
        runCommand('file', ['./'], { cwd: os.cwd, successMessage: 'Success!' }),
      ).resolves.toBe(0),
      expect(
        runCommand('file', ['/invalid-file', '--non-option'], {
          scope: undefined,
        }),
      ).rejects.not.toBe(0),
      expect(runCommand('asdfgasdfg', [], {})).rejects.not.toBe(0),
    ]);
  });
});
