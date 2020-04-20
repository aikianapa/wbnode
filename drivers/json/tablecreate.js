module.exports = function(_table) {
  const FileSystem = require('fs')
  var fname = tableFile(_table)
  if (!is_exists(fname)) {
    var data = {};
    data[_table] = {}
    data = JSON.stringify(data);
    let err = FileSystem.writeFileSync(fname, data);
    if (err) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}
