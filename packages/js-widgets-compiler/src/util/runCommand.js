const debug = require('debug')('widget:execute');
const { spawn } = require('child_process');

/**
 * Runs a command in a child process as a promise.
 *
 * @param command
 *   Same as in child_process.spawn.
 * @param args
 *   Same as in child_process.spawn.
 * @param options
 *   Same as in child_process.spawn but with a scope and successMessage on top.
 *
 * @returns {Promise<int>}
 *   Resolves if the command ends successfully and rejects otherwise.
 */
module.exports = (command, args, options) =>
  new Promise((resolve, reject) => {
    const { scope, successMessage } = options;
    const subprocess = spawn(command, args, options);
    subprocess.stdout.setEncoding('utf8');
    subprocess.stdout.on('data', (data) => {
      debug('[debug] - [%s] %s', scope, data);
    });
    subprocess.stderr.setEncoding('utf8');
    subprocess.stderr.on('data', (data) => {
      debug('[%s] %s', scope, data);
    });
    const listener = (code) => {
      if (code) {
        reject(code);
        return;
      }
      if (successMessage) {
        debug('[info] - [%s] %s', scope, successMessage);
      }
      resolve(code);
    };
    subprocess.on('close', listener);
    subprocess.on('exit', listener);
    subprocess.on('error', reject);
  });
