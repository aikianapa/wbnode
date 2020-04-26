module.exports = (function( wbn ) {
  var fs = require('fs')
  fs.readdir(__dirname, function(err,list){
    if (!err) {
        for(i in list) {
            let fname = list[i]
            let name = fname.substr(0,fname.length-3)
            if (name !== 'init') {
                wbn.$.fn[`cmd_${name}`] = require(`./${fname}`)(wbn);
            }
        }
    }
  })
});
