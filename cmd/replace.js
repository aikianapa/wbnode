module.exports =  (function( wbn ) {
  var $ = wbn.$
  return function(){
      let params = $(this).data("wb-params");
      let base = $.basepath;
      let file = wbn.params.path_app + "/" + base + params.file
      let repl = readFile(file);
      if (repl.errno) {
        $(this).replaceWith(`<b>File not found</b>: ${file}`);
      } else {
        $(this).replaceWith($(repl).fetch());
      }
  }
});
