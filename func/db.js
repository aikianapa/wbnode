module.exports = function(driver) {
  this.itemRead = require('../drivers/'+driver+'/itemread.js'),
  this.itemSave = require('../drivers/'+driver+'/itemsave.js'),
  this.tableFile = require('../drivers/'+driver+'/tablefile.js')
  this.tableCreate = require('../drivers/'+driver+'/tablecreate.js')
}
