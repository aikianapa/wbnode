module.exports = function(_table, _id, callback) {
  var db = tableOpen(_table)
  if (typeof _id == "string") {
      var query = {"_id": _id}
  } else {
      var query = _id
  }
  console.log(query);
  db.findOne(query,function(err,item){
      if (typeof callback == "function") callback(err, item)
      return item;
  })
}
