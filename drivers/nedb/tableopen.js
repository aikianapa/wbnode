module.exports = function(_table) {
    var Datastore = this.Datastore
    if (!this.Db[_table]) {
        this.Db[_table] = new Datastore(tableFile(_table));
        this.Db[_table].loadDatabase()
        this.Db[_table].ensureIndex({ fieldName: '_id', unique: true, sparse: true }, function (err) {
        });
    }
    return this.Db[_table]
}
