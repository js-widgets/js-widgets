const fs = require('fs');
const path = require('path');

/**
 * Removes a non-empty directory recursively.
 *
 * @param {string} folderPath
 *   The path to the directory.
 */
const rmdirRecursiveSync = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    return;
  }
  fs.readdirSync(folderPath).forEach((file) => {
    const curPath = path.join(folderPath, file);
    fs.lstatSync(curPath).isDirectory()
      ? rmdirRecursiveSync(curPath)
      : fs.unlinkSync(curPath);
  });
  fs.rmdirSync(folderPath);
};

module.exports = rmdirRecursiveSync;
