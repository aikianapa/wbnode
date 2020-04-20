module.exports = function(fname) {
  const FileSystem = require('fs')
  try {
    return FileSystem.readFileSync(fname, 'utf8');
  } catch (err) {
    return err;
  }
}
