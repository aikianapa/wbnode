module.exports = function(_table, _item) {
  _item = itemInit(_item)
  const FileSystem = require('fs')
  try {
    var fname = tableFile(_table)
    var fd = FileSystem.openSync(fname, 'w+', 0o666);
    var data = readFile(fd)
    if (data > "{}") {
        data = JSON.parse()
    } else {
        data = {}
    }

    if (!data) return false;
    if (!data[_table]) data[_table] = {};

    if (data[_table]._id) {
      cache = data[_table]._id
    } else {
      cache = _item
    }
    if (!cache._id) cache._id = newId()
    data[_table][cache._id] = cache;
    data = JSON.stringify(data);
    var res = FileSystem.writeFileSync(fd, data);
    FileSystem.closeSync(fd);
    return res;
  } catch (err) {
    return err;
  }
}
