module.exports = function(_table, _id, callback) {
  var db = tableOpen(_table)
  db.find({"_id": _id},function(err,item){
      if (typeof callback == "function") callback(err, item)
      return item;
  })
}
