module.exports =  (function( wbn ) {
  var $ = wbn.$
  return function(){
      let params = $(this).data("wb-params");
      let base = $.basepath;
      let file = wbn.params.path_app + "/" + base + params.file
      let repl = readFile(file);
      $(this).html(repl);
  }
});
