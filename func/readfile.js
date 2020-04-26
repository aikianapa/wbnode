module.exports = function(fname) {
  const Path = require('path');
  const FileSystem = require('fs')
  fname = Path.normalize(fname)
  try {
    return FileSystem.readFileSync(fname, 'utf8');
  } catch (err) {
    return err;
  }
}
