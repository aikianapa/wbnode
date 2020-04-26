module.exports = function(pathname) {
  const path = require('path');
  const fs = require('fs');
  if (!is_exists(pathname)) return false;
  return fs.statSync(pathname).isFile();
}
