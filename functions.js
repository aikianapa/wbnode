module.exports = function(options) {
      this.newId = require('./func/newid'),
      this.strpos = require('./func/strpos'),
      this.microtime = require('./func/microtime'),
      this.dechex = require('./func/dechex'),
      this.date = require('./func/date'),
      this.str_repeat = require('./func/str_repeat'),
      this.readFile = require('./func/readfile'),
      this.writeFile = require('./func/writefile'),
      this.is_exists = require('./func/is_exists'),
      this.is_file = require('./func/is_file'),
      this.db = require('./drivers/' +options.driver+ '/init')(),
      this.itemInit = require('./func/iteminit')
      this.md5 = require('./func/md5')
}
