module.exports = function(string) {
  const Crypto = require('crypto')
  return Crypto.createHash('md5').update(string).digest('hex');
}
