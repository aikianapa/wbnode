"use strict"
if (typeof $ == 'undefined') {
    alert("jQuery required!");
} else {

var wbapp = new Object();
var data = {};

wbapp.eventsInit = function() {
  $(document).delegate("[data-ajax]","tap click",function(){
      let params = wbapp.parseAttr($(this).attr("data-ajax"));
      wbapp.ajax(params);
  })
  $(document).delegate("[data-bind]","tap click",function(){
      let params = wbapp.parseAttr($(this).attr("data-bind"));
      if (params.idx)  eval(params.data + '._idx=params.idx;');
      eval(params.bind + '=' + params.data + ';');
      // после бинда нужно пересчитать значения полей
    //  setTimeout(function(){wbapp.updateInputs()},110);
  })
}

wbapp.updateInputs = function(){
    $(document).find(":checkbox").each(function(){
        if ($(this).attr("value") == "on") {
            $(this).attr("checked",true).prop("checked",true);
        } else {
            $(this).attr("checked",false).prop("checked",false);
        }
    })
}

wbapp.checkJson = function(queryString) {
    queryString = str_replace(" ","",queryString.trim());
    if (queryString == "{}") return true;
    if (queryString.substr(0,1) == "{" && queryString.substr(-1) == "}" && strpos(queryString,":")) return true;
    return false;
}

wbapp.parseAttr = function(queryString = null) {
    if (queryString == null) queryString = $(this).attr("data-wb");
    var params = {};
    if (wbapp.checkJson(queryString)) {
        params = JSON.parse(queryString);
    } else {
        var queries, temp, i, l;
        queries = queryString.split("&");
        // Convert the array of strings into an object
        for ( i = 0, l = queries.length; i < l; i++ ) {
            temp = queries[i].split('=');
            params[temp[0]] = temp[1];
        }
    }
    $(this).data("wb-params",params);
    return params;
}

wbapp.ajax = async function(params) {
    if (!params.url && !params.tpl) return;
    if (params.tpl && params.replace !== undefined) {
        let target = params.replace.replace("#","");
        let tpl = await $.get(params.tpl)
        $(params.replace).replaceWith(tpl)
        $(document).trigger("tpl-done",params);
    }
    if (params.tpl && params.include !== undefined) {
        let target = params.include.replace("#","");
        let tpl = await $.get(params.tpl)
        $(params.include).html(tpl)
        $(document).trigger("tpl-done",params);
    }
    if (params.url !== undefined) {
        $.get(params.url,function(data){
            if (params.callback) eval('params = '+params.callback+'(params,data)');
            if (params.form) wbapp.formByObj(params.form,data);
            if (params.bind) {
                var update = [];
                $.each(data,function(key,value){
                    update[key] = value
                });
                eval('data.'+params.bind + ' = update;');
                console.log(data);
            }
            if (params._trigger !== undefined && params._trigger == "remove") eval( 'delete ' + params.data );
            if (params.dismiss && params.error !== true) {
                $("#"+params.dismiss).modal("hide");
            }
            $(document).trigger("ajax-done",params);
        });
    }
}

wbapp.save = function(params,event) {
  let that = this;
  let data, form, result;
  let method = "POST";
  if (params.form !== undefined) {
      form = $("#"+params.form);} else {form = $(this).closest("form");
      if ($(form).attr("method") !== undefined) method = $(form).attr("method");
  }
  data = wbapp.objByForm(params.form);
  if (data._idx) delete data._idx;

  $.post(params.url,data,function(data) {
          if (params.callback) eval('params = '+params.callback+'(params,data)');
          if (params.data && params.error !== true) {
              var update = [];
              var dataname;
              $.each(data,function(key,value){
                  update[key] = value
              });
              eval('var checknew = (typeof ' +params.data+');');
              if (checknew == "undefined") {
                  eval(`dataname = str_replace("['`+data._id+`']","","`+params.data+`");`);
                  console.log(dataname);
                  eval(dataname+'.push(update)');
              } else {
                  eval(params.data + ' = update;');
              }
          }
          if (params.dismiss && params.error !== true) {
              $("#"+params.dismiss).modal("hide");
          }
  });
}

wbapp.formByObj = function(form,data) {
    form = $("#"+form);
    $(form)[0].clear;
    $.each(data,function(key,value){
        $(form).find("[name='"+key+"']").val(value);
    });
}

wbapp.objByForm = function(form) {
    form = $("#"+form);
    let data = $(form).serializeJson();
    return data;
}

wbapp.tplInit = function() {
    $(document).find("template[id]").each(function(){
        var tid = $(this).attr("id");
        if (tid > "") {
            params = [];
            if ($(this).attr("data-params") !== undefined) params = json_decode($(this).attr("data-params"));
            wbapp.template(tid,{
              html:$(this).html(),
              params:params
            });
            $(this).removeAttr("data-params");
            if ($(this).attr("visible") == undefined) $(this).remove();
        }
    });
}

wbapp.newId = function(separator, prefix) {
  if (separator == undefined) {
    separator = "";
  }
  var mt = explode(" ", microtime());
  var md = substr(str_repeat("0", 2) + dechex(ceil(mt[0] * 10000)), -4);
  var id = dechex(time() + rand(100, 999));
  if (prefix !== undefined && prefix > "") {
    id = prefix + separator + id + md;
  } else {
    id = id + separator + md;
  }
  return id;
}

wbapp.modalsInit = function() {
  var zndx = $(document).data("modal-zindex");
  if (zndx == undefined) $(document).data("modal-zindex", 2000);

  $(document).delegate(".modal-header","dblclick",function(event){
      var that = $(event.target);
      $(that).closest(".modal").find(".modal-content").toggleClass("modal-wide");
  });


  $(document).delegate(".modal", "shown.bs.modal", function(event) {
      var that = $(event.target);
      if ($(that).is("[data-zndx]")) return;
      $(that).find('.modal-content')
  //      .resizable({
  //        minWidth: 300,
  //        minHeight: 175,
  //        handles: 'n, e, s, w, ne, sw, se, nw',
  //      })
        .draggable({
          handle: '.modal-header'
        });

      var zndx = $(document).data("modal-zindex");
      if (zndx == undefined) {
        var zndx = 4000;
      } else {
        zndx += 10;
      }
      if (!$(this).closest().is("body")) {
          if ($(this).data("parent") == undefined) $(this).data("parent", $(this).closest());
          $(this).appendTo("body");
      }
      $(this).data("zndx", zndx).css("z-index", zndx).attr("data-zndx",zndx);
      $(that).find("[data-dismiss]").attr("data-dismiss",zndx);
      $(document).data("modal-zindex", zndx);
      if ($(that).attr("data-backdrop") !== undefined && $(that).attr("data-backdrop") !== "false") {
        setTimeout(function() {
          $(".modal-backdrop:not([id])").css("z-index", (zndx - 5)).attr("id", "modalBackDrop" + (zndx - 5));
        }, 0);
      }
  });

  $(document).delegate(".modal [data-dismiss]","click",function(event){
      var zndx =  $(this).attr("data-dismiss");
      var modal = $(document).find(".modal[data-zndx='"+$(this).attr("data-dismiss")+"']");
        modal.modal("hide");
  });

  $(document).delegate(".modal", "hide.bs.modal", function(event) {
    var that = $(event.target);
    var zndx = $(that).attr("data-zndx");
    $("#modalBackDrop" + (zndx - 5) + ".modal-backdrop").remove();
    $(document).data("modal-zindex", zndx - 10);
  });
  $(document).delegate(".modal", "hidden.bs.modal", function(event) {
    var that = $(event.target);
    if ($(this).hasClass("removable")) {$(that).modal("dispose").remove();}
    else {$(this).appendTo($(this).data("parent"));}
  });
  $(document).off("wb-ajax-done");
  $(document).on("wb-ajax-done",function(){
      console.log("Trigger: wb-ajax-done");
      if (wbapp !== undefined) {
        wbapp.tplInit();
        wbapp.watcherInit();
        wbapp.wbappScripts();
        wbapp.pluginsInit();
      }
      $(".modal.show:not(:visible),.modal[data-show=true]:not(:visible)").modal("show");
      if ($.fn.tooltip) $('[data-toggle="tooltip"]').tooltip();
  });
}

wbapp.getSync = async function(url,data = {}) {
    return await $.get(url,data)
}

wbapp.postSync = async function(url,data = {}) {
    return await $.post(url,data)
}

wbapp.loadScripts = async function(scripts = [], trigger = null, func = null) {
  if (wbapp.loadedScripts == undefined) wbapp.loadedScripts = [];
  let i = 0;
  scripts.forEach(function(src) {
//    let name = src.split("/");
//    name = name[name.length-1];
    let name = src;
    if (wbapp.loadedScripts.indexOf(name) !== -1) {
      i++;
      if (i >= scripts.length) {
        if (func !== null) return func(scripts);
        if (trigger !== null) {
          $(document).find("script#" + trigger + "-remove").remove();
          $(document).trigger(trigger);
          console.log("Trigger: " + trigger);
        }
      }
    } else {
      var script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = function() {
        i++;
        console.log("Script loaded: " + name);
        wbapp.loadedScripts.push(name);
        if (i >= scripts.length) {
          if (func !== null) return func(scripts);
          if (trigger !== null) {
            $(document).find("script#" + trigger + "-remove").remove();
            console.log("Trigger: " + trigger);
            $(document).trigger(trigger);
          }
        }
      }
      document.head.appendChild(script);
    }
  });
}

wbapp.loadStyles = async function(styles = [], trigger = null, func = null) {
  if (wbapp.loadedStyles == undefined) wbapp.loadedStyles = [];
  var i = 0;
  styles.forEach(function(src) {
    if (wbapp.loadedStyles.indexOf(src) !== -1) {
      i++;
      if (i >= styles.length) {
        if (func !== null) return func(styles);
        if (trigger !== null) {
          console.log("Trigger: " + trigger);
          $(document).find("script#" + trigger + "-remove").remove();
          $(document).trigger(trigger);
        }
      }
    } else {
      var style = document.createElement('link');
      wbapp.loadedStyles.push(src);
      style.href = src;
      style.rel = "stylesheet";
      style.type = "text/css";
      style.async = false;
      style.onload = function() {
        i++;
        if (i >= styles.length) {
          if (func !== null) return func(styles);
          if (trigger !== null) {
            $(document).find("script#" + trigger + "-remove").remove();
            $(document).trigger(trigger);
            console.log("Trigger: " + trigger);
          }
        }
      }
      document.head.appendChild(style);
    }
  });
}

$.fn.serializeJson = function(data = {}) {
  var form = $(this).clone();
  $(form).find("form, .wb-unsaved, .wb-tree-item").remove();
  var branch = $(form).serializeArray();
  $(branch).each(function(i, val) {
    data[val["name"]] = val["value"];
    if ($(form).find("textarea[type=json][name='" + val["name"] + "']").length && strpos(data[val["name"]],"}")) {
          data[val["name"]] = json_decode(data[val["name"]]);
        }
  });
  var check = $(form).find('input[type=checkbox]');
  // fix unchecked values
  $.each(check,function(){
      if (this.name > "") {
        data[this.name] = "";
        if (this.checked) data[this.name] = "on";
      }
  });
  $(form).remove();
  return data;
}

  if (typeof str_replace == 'undefined') {
      wbapp.loadScripts([`/engine/js/php.js`,`/engine/js/vue.min.js`],"wbapp-go")
  } else {
      $(document).on("wbapp-go")
  }

  $(document).on("wbapp-go",function(){
      wbapp.eventsInit();
  })
}
