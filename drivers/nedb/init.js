module.exports = function() {
  this.Datastore = require('nedb')
  this.Db = {}
  this.tableOpen = require(__dirname+'/tableopen.js')
  this.itemRead = require(__dirname+'/itemread.js')
  this.itemSave = require(__dirname+'/itemsave.js')
  this.itemRemove = require(__dirname+'/itemremove.js')
  this.tableFile = require(__dirname+'/tablefile.js')
  this.tableFlush = require(__dirname+'/tableflush.js')
  this.tableCreate = require(__dirname+'/tablecreate.js')
}
