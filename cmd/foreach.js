module.exports =  (function( wbn ) {
  var $ = wbn.$
  return function(Item = {}){
      var $doc = this
      let params = $(this).data("wb-params");
      if (params.count) {
          let item = Object.assign({}, Item)
          for(i=1; i<= params.count; i++) {
              let line = Object.assign({}, item)
              if (line._id == undefined) line._id = i
              Item[i] = line
          }
      }
      var tpl = $doc.html()
      $doc.html("")
      $.each(Item,function(key,val) {
          let $tpl = $(tpl)
          let data = Object.assign({}, val)
          $tpl.fetch(val)
          $doc.append($tpl)
      })
  }
})
