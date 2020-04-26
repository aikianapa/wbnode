module.exports = function(_table, _item, callback) {
    _item = itemInit(_item)
    var db = tableOpen(_table)
    var id = _item._id
    db.findOne({_id: id},function(err,check){
    if (check) {
      db.update({ _id: id, _created: {$exists: true} }, _item, {}, function(err,num,updItem){
          if (err) return err;
          db.findOne({_id: id},function(err,updItem) {
              if (typeof callback == "function") callback(err, updItem)
              return updItem
          });
      })
    } else {
      db.insert(_item, function (err, insItem) {
          if (typeof callback == "function") callback(err, insItem)
          return insItem
      });
    }
});
}
