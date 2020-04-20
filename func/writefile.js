module.exports = function(fname, string) {
  const FileSystem = require('fs')
  try {
    var fd = FileSystem.openSync(fname, 'w+', 0o666);
    var res = FileSystem.writeFileSync(fd, string);
    FileSystem.closeSync(fd);
    return res
  } catch (err) {
    return err;
  }
}
