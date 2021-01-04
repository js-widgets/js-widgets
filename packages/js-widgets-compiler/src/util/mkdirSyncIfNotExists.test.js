const mkdirSyncIfNotExists = require('./mkdirSyncIfNotExists');

const fs = require('fs');

describe('mkdirSyncIfNotExists', () => {
  const dir = 'any-name';
  it('should create the directory if it does not exist', () => {
    expect.assertions(1);
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    jest.spyOn(fs, 'mkdirSync');
    mkdirSyncIfNotExists(dir);
    expect(fs.mkdirSync).toHaveBeenCalledWith(dir, { recursive: true });
  });
  it('should not create the directory if it exists', () => {
    expect.assertions(1);
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'mkdirSync');
    mkdirSyncIfNotExists(dir);
    expect(fs.mkdirSync).not.toHaveBeenCalledWith();
  });
});
