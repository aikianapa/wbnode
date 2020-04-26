module.exports = function(_table,create = false) {
    var Datastore = this.Datastore
    var file = tableFile(_table)
    if (!create && !is_file(file)) throw(`DB ${_table} not found`)
    if (!this.Db[_table]) {
        this.Db[_table] = new Datastore(file);
        this.Db[_table].loadDatabase()
        this.Db[_table].ensureIndex({ fieldName: '_id', unique: true, sparse: true }, function (err) {
        });
    }
    return this.Db[_table]
}
