module.exports = function() {
  this.itemRead = require(__dirname+'/itemread.js')
  this.itemSave = require(__dirname+'/itemsave.js')
  this.tableFile = require(__dirname+'/tablefile.js')
  this.tableCreate = require(__dirname+'/tablecreate.js')
}
