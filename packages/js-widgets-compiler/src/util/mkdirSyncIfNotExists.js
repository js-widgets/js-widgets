const fs = require('fs');

module.exports = (dir) => {
  if (fs.existsSync(dir)) {
    return;
  }
  fs.mkdirSync(dir, { recursive: true });
};
