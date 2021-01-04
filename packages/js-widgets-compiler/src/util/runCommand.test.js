const os = require('os');

const runCommand = require('./runCommand');

describe('runCommand', () => {
  it('executes the file command', async () => {
    expect.assertions(4);
    await Promise.all([
      expect(
        runCommand('file', ['./'], { cwd: os.cwd, successMessage: 'Success!' }),
      ).resolves.toBe(0),
      // Re-run without success message to exercise "else" path.
      expect(runCommand('file', ['./'], { cwd: os.cwd })).resolves.toBe(0),
      expect(
        runCommand('file', ['/invalid-file', '--non-option'], {
          scope: undefined,
        }),
      ).rejects.not.toBe(0),
      expect(runCommand('asdfgasdfg', [], {})).rejects.not.toBe(0),
    ]);
  });
});
