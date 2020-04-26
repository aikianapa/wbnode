module.exports =  (function( wbn ) {
  var $ = wbn.$
  return function(){
      let params = $(this).data("wb-params");
      if (params.event == undefined) params.event = "onclick"
      let callback = "wbapp.save(" + JSON.stringify(params) + ",this)"
      $(this).attr(params.event,callback)
  }
});
