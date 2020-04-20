module.exports = function(path) {
  const FileSystem = require('fs')
  return FileSystem.existsSync(path);
}
