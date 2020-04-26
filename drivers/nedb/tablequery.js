module.exports = function(_table, _query, callback) {
  var db = tableOpen(_table)
  db.find(_query,function(err,docs){
      if (typeof callback == "function") callback(err, docs)
      return docs;
  })
}
