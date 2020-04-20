module.exports = function( input, multiplier ) {	// Repeat a string
  var buf = '';
  for (i=0; i < multiplier; i++){
    buf += input;
  }
  return buf;
}
