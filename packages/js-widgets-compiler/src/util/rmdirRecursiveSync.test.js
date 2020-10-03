const fs = require('fs');

const rmdirRecursiveSync = require('./rmdirRecursiveSync');

describe('rmdirRecursiveSync', () => {
  const createDir = () => {
    fs.mkdirSync('./tests/created/first', { recursive: true });
    fs.mkdirSync('./tests/created/second/third', { recursive: true });
    fs.closeSync(fs.openSync('./tests/created/file1', 'w'));
    fs.closeSync(fs.openSync('./tests/created/first/file2', 'w'));
    fs.closeSync(fs.openSync('./tests/created/second/file3', 'w'));
  };

  it('deletes a directory', () => {
    expect.assertions(3);
    createDir();
    rmdirRecursiveSync('./tests/created');
    expect(fs.existsSync('./tests/created')).toBe(false);
    expect(fs.existsSync('./tests/does-not-exist')).toBe(false);
    expect(() => rmdirRecursiveSync('./tests/does-not-exist')).not.toThrow();
  });
});
