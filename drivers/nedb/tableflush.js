module.exports = function(_table) {
  var db = tableOpen(_table)
  db.persistence.compactDatafile()
}
