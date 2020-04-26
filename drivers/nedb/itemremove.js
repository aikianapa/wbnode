module.exports = function(_table, _id, callback) {
  var db = tableOpen(_table)
  db.remove({"_id": _id},function(err,removed){
      if (typeof callback == "function") callback(err, removed)
      return removed;
  })
}
