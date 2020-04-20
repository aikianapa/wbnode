module.exports = function ( haystack, needle, offset){
       var i = haystack.indexOf( needle, offset ); // returns -1
       return i >= 0 ? i : false;
}
