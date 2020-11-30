const { EventEmitter } = require('events');

jest.mock('axios', () =>
  jest.fn().mockResolvedValue({
    data: {
      pipe: jest
        .fn()
        .mockImplementation((w) => setTimeout(() => w.emit('finish'), 30)),
    },
  }),
);
const axios = require('axios');
const fs = require('fs');
jest.spyOn(fs, 'createWriteStream');

const remoteCopy = require('./remoteCopy');

describe('remoteCopy', () => {
  const writter = new EventEmitter();
  jest
    .spyOn(fs, 'createWriteStream')
    .mockImplementation()
    .mockReturnValue(writter);
  it('should call axios', async () => {
    expect.assertions(2);
    const output = await remoteCopy(
      'file:///srv/assets/widget-1.0.0.tar.gz',
      '/tmp',
      {},
    );
    expect(axios).toHaveBeenCalledWith({
      headers: {},
      method: 'GET',
      responseType: 'stream',
      url: 'file:///srv/assets/widget-1.0.0.tar.gz',
    });
    expect(output).toBe('/tmp');
  });
  it('should pipe the file', async () => {
    expect.assertions(3);
    // The following ensures the finish event id triggered. Otherwise the assertions count will fail.
    writter.on('finish', () => expect(true).toBeTruthy());
    await remoteCopy('li', '/tmp', {});
    expect(writter.eventNames()).toContain('finish');
    expect(writter.eventNames()).toContain('error');
  });
});
