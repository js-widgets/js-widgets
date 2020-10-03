const listFilesSync = require('./listFilesSync');

describe('listFilesSync', () => {
  it('shows all the files', () => {
    expect.assertions(1);
    expect(listFilesSync(`${__dirname}/../../tests`)).toMatchSnapshot();
  });
});
