const Sugar = require('sugar')
const Mustache = require('mustache')
const Window = require('window');
const Express = require('express')
const session = require('express-session')
const app = Express()
const pathToRegexp = require('path-to-regexp')
const window = new Window();
const $ = require('jquery')(window);
const jq = window.document.createElement(':root');
require('./functions')({driver:'nedb'}) // подключаем функции

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

var routes = {}
var wbdef = {
    controller: "form",
    mode: "show",
    table: "pages",
    item: "home",
    tpl: "default.html",
}
var params = {
    start: "./index.html"
}

var listen = function(port = 5000, options = {}) {


  app.listen(port, function () {
    console.log('Example app listening on port 3000!');
  });
  //var static = require('diet-static')({ path: app.path+params.static })
  //app.footer(static);

  // Attach static as a global footer

  if (options.start) params.startPage = options.start

  app.get('*', function(req,res) {
      return worker(req)
  });

  app.post('*', function(req) {
      return worker(req)
  });

  function worker(req) {
      req._data = {
            _unique: function() {return newId()},
            _post: {},
            _get: {},
            _item: {}
      };
      //req.wbn = wbn
      //req.$jq = $(jq)
      req.route = getRoute(req)
      result = req.res
      result.request = req
      result.wbn = wbn
      result.$jq = $(jq)
      result.html = function(html) {
          result.header("Content-Type","text/html")
          result.end(html)
      }
      result.json = function(html) {
          result.header("Content-Type","application/json")
          result.end(html)
      }
      console.log("Trigger: route-"+req.route.routeName);
      $(jq).trigger("route-"+req.route.routeName,req)
      if (req.route.controller) {
          var controller = require("./controllers/"+req.route.controller)
          controller(result)
      } else {
        result.status(404);
        result.end("Error 404");
      }
  }
}

var addStatic = function(path) {
    app.use(Express.static('static'));
}

var addRoute = function(route1 = "/", route2 = {}, routeName = null) {
  route1 = route1.split("/")
  $.each(route1,function(i,item){
    item = item.split(":")
    if (item[1] !== undefined ) {
        if (item[0] > '') {
          route2[item[1]] = item[0]
          route1[i] = item[0]
        } else {
          route2[item[1]] = "$$"+i
          route1[i] = ":"+item[1]
        }
    }
  })
  route1 = route1.join("/")
  route = {route1,route2}
  if (routes == undefined) routes = []
  if (routeName == null || routeName == "") {
    routes[Object.keys(routes).length] = route;
  } else {
    routes[routeName] = route;
  }
}

var getRoute = function(req) {
  var route = {}
  route.query = Sugar.Object.fromQueryString(req._parsedUrl.query, {
    separator: '.'
  });
  route = {
       protocol: req._parsedUrl.protocol
      ,port: req._parsedUrl.port
      ,href: req._parsedUrl.href
      ,host: req._parsedUrl.host
      ,hostname: req._parsedUrl.hostname
      ,path: req._parsedUrl.pathname
      ,path_app: req.app.path
      ,queryString: req._parsedUrl.query
      ,url: req.originalUrl
  }
  route.params = route.path.split('/')
  route.params.splice(0, 1);
  let finded = false;
  $.each(routes,function(i,pattern){
      if (finded == false) {
            let regexp = pathToRegexp(pattern.route1);
            let res = regexp.exec(route.path);
            if (res) {
                finded = true
                $.each(pattern.route2,function(key,val){
                      if (val.substr(0,2) == "$$") {
                          let idx = val.substr(2,val.length) *1 -1
                          if (route.params[idx] !== undefined) route[key] = route.params[idx]
                      } else if (val.substr(0,1) == "$") {
                          let idx = val.substr(1,val.length) *1 -1
                          if (route.params[idx] !== undefined) route[key] = route.params[idx]
                      } else {
                          if (route[pattern.route2[key]] == undefined) route[key] = val;
                      }
                })
                route.pattern = pattern;
                route.routeName = i;
                if (routes[i].routeName !== undefined) route.routeName = routes[i].routeName
                return;
            }
        }
  })
  if (finded && !route.controller) route.controller = wbdef.controller
//  console.log(route)
  return route;
}

var objLength = function(obj){
    return Object.keys(obj).length
}

var fromFile = function(file) {
  let string = readFile(file);
  if (string.errno) {
    string = {Error: string}
    return string;
  }
  return fromString(string);
}

var fromString = function(string) {
  let document = window.document.createElement(':root');
  return $(document).html(string, {
    xmlMode: true
  });
}

var normalizepath = function(pathname) {
  return (
    decodeURI(pathname)
      .replace(/\/+/g, "/")
      .normalize()
  );
}

$.fn.fetch = function(data = undefined) {
    if (data == undefined) data = $(this).data("data");
    if (data == undefined) data = {};
    $(this).data("data",data)
    if ($(this).is("[data-wb]")) {
        $(this).fetchNode(data);
    } else {
        $(this).children("*").each(function(){
            if ($(this).is("[data-wb]")) {
                $(this).fetchNode(data);
            } else {
                $(this).fetch(data);
            }
        });
    }
    return $(this).setData(data);
}

$.fn.fetchNode = function() {
    params = $(this).parseAttr();
    if (!params.cmd) return;
    let func = "cmd_" + params.cmd;
    if ($.isFunction($(this)[func]) && $(this).hasAttr("data-wb")) {
        $(this)[func]();
        $(this).removeAttr("data-wb");
        $(this).fetch(data);
    }
    return $(this);
}


$.fn.setData = function(data) {
  if (data == undefined) data = $(this).data("data");
  if (data == undefined) data = {};
  $(this).data("data",data)
  if ($(this).item !== undefined) data = $(this).item;
  $(this).setValuesStr(data);
  return $(this);
}

$.fn.setValuesStr = function(data={}) {
  var outer = $(this).outerHTML();
  if (strpos(outer,"}}")) {
      $.each(data,function(key,val){
          data[key] = val;
      })
      outer = Mustache.render(outer,data);
      $(this).replaceWith(outer);
  }
}

$.fn.outerHTML = function(clear = false) {
    if (clear) {
        $(this).find(".wb-done").removeClass("wb-done");
        $(this).find("[wb-exclude-id]").removeAttr("wb-exclude-id");
    }
    return $(this).prop('outerHTML');
}

$.fn.hasAttr = function(attr) {
  let res = false;
  if ($(this).is("["+attr+"]")) res = true;
  return res;
}

$.fn.cmd_replace = function(){
    let params = $(this).data("wb-params");
    let repl = readFile(params.file);
    $(this).replaceWith($(repl).fetch());
}

$.fn.cmd_include = function(){
    let params = $(this).data("wb-params");
    let repl = readFile(params.file);
    $(this).html(repl);
}

$.fn.cmd_save = function(){
    let params = $(this).data("wb-params");
    if (params.event == undefined) params.event = "onclick"
    let callback = "wbapp.save(" + JSON.stringify(params) + ",this)"
    $(this).attr(params.event,callback)
}

$.fn.parseAttr = function(queryString = null) {
    if (queryString == null) queryString = $(this).attr("data-wb");
    var params = {}, queries, temp, i, l;
    queries = queryString.split("&");
    // Convert the array of strings into an object
    for ( i = 0, l = queries.length; i < l; i++ ) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
    $(this).data("wb-params",params);
    return params;
}




$.fn.setValues = function(data) {
    // Выяснить, мы получаем шаблон или нам нужно его загрузить
    // обязательно закешировать результат
    var str = $(this).outerHtml();
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :

      // Сгенерировать (и закешировать) функцию,
      // которая будет служить генератором шаблонов
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Сделать данные доступными локально при помощи with(){}
        "with(obj){p.push('" +

        // Превратить шаблон в чистый JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("{{").join("\t")
          .replace(/((^|}})[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)}}/g, "',$1,'")
          .split("\t").join("');")
          .split("}}").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");

    // простейший карринг(термин функ. прог. - прим. пер.)
    // для пользователя
    return data ? fn( data ) : fn;
  };

var wbn = {
  Wbn: this,
  listen: listen,
  fromFile: fromFile,
  fromString: fromString,
  readFile: readFile,
  addStatic: addStatic,
  addRoute: addRoute,
  getRoute: getRoute,
  routes: routes,
  params: params
};

module.exports = wbn
