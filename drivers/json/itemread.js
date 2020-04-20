module.exports = function(_table, _id) {
    const jsonQ = require('js-jsonq');
    var fname = tableFile(_table)
    var data = JSON.parse(readFile(fname))
    if (data[_table].length) {
        data = new jsonQ(data);
        return data.where("_id", _id).from(_table).fetch();
    } else {
        return false;
    }
}
