const Sugar = require('sugar')
const Mustache = require('mustache')
const Window = require('window');
const Express = require('express')
const BodyParser = require('body-parser');
const Path = require('path');
const session = require('express-session')
const app = Express()
const pathToRegexp = require('path-to-regexp')
const mime = require('mime')
const fs = require('fs')
const window = new Window();
const $ = require('jquery')(window);
const jq = window.document.createElement(':root');
require('./functions')({driver:'nedb'}) // подключаем функции

app.set('trust proxy', 1) // trust first proxy
app.use(BodyParser.urlencoded({extended: true}));
app.use(BodyParser.json());
app.use(session({
  secret: 'Web Basic Engine',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

var path_app = app.settings.views.split("/")
path_app.pop()
path_app = path_app.join("/");

var routes = {}
var modules = {}
var wbdef = {
    controller: "form",
    mode: "show",
    table: "pages",
    item: "home",
    tpl: "index.html",
}
var params = {
    start: false,
    path_app: path_app,
    path_wbn: __dirname,
}

var listen = function(port = 80, options = {}) {
  params.port = port

  app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
  });
  //var static = require('diet-static')({ path: app.path+params.static })
  //app.footer(static);

  // Attach static as a global footer

  if (options.start) params.start = options.start

  app.get('*', function(req,res) {
      return worker(req)
  });

  app.post('*', function(req) {
      return worker(req)
  });

  function worker(request) {
      request._data = {
            _unique: function() {return newId()},
            _post: {},
            _get: {},
            _item: {}
      };
      wbn.route = getRoute(request)
      request.route = wbn.route
      request.wbn = wbn
      request.$jq = $(jq)
      result = request.res
      result.request = request
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

      if (wbn.route.filename) {
        wbn.route.filename = Path.normalize(wbn.route.filename)
        // здесь нужно добавить возможность отдавать 404 ошибку для закрытых настройками безопасности файлов


          if (wbn.route.ext == ".html" || wbn.route.ext == ".htm" || wbn.route.ext == ".tpl") {
            let tpl = fromFile(wbn.route.filename)
            tpl.fetch()
            result.html(tpl.html())
          } else {
            let file = fs.readFileSync(wbn.route.filename);
            result.header("Content-Type",mime.lookup(wbn.route.filename))
            result.header("Content-Length",wbn.route.size)
            result.end(file)
          }
          return
      }

      if (request.route.routeName !== undefined) {
          console.log(`Trigger: route-${request.route.routeName}`);
          $(jq).trigger("route-"+request.route.routeName,request)
      }
      if (request.route.controller) {
          var controller = require(`./controllers/${request.route.controller}`)
          if ($.isFunction(controller)) {
            controller(request, result)
          } else {
            result.status(404);
            result.end("Error 404");
          }
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
       protocol: req.protocol
      ,port: params.port
      ,method: req.method
      ,href: req._parsedUrl.href
      ,hostname: req.hostname
      ,path: req._parsedUrl.pathname
      ,path_app: wbn.params.path_app
      ,path_wbn: wbn.params.path_wbn
      ,queryString: req._parsedUrl.query
      ,query: req.query
      ,url: req.originalUrl
      ,sessid: req.sessionID
      ,host: `${req.protocol}://${req.hostname}`
  }
  if (route.port > "" && route.port !== 80) route.host += ":" + route.port
  route.params = route.path.split('/')
  route.params.splice(0, 1);
  if (route.method == 'POST') route._post = req.body
  if (route.method == 'GET') route._get = route.query

  let filename = route.path_app + route.path
  if (is_file(filename)) {
      let stat = fs.statSync(filename);
      route.filename = filename
      route.mime = mime.lookup(filename)
      route.size = stat.size
      route.ext = Path.extname(filename)
      return route
  }

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
  return route;
}

var objLength = function(obj){
    return Object.keys(obj).length
}

var fromFile = function(file) {
  let string = readFile(file);
  if (string.errno) console.log(string);
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

$.fn.fetchNode = function(data) {
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
  if (outer && strpos(outer,"}}")) {
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

$.fn.base = function(path) {
    $.basepath = path
    var base = `<base href="${path}" />`
    if ($(this).find("head").length) {
        $(this).find("head").prepend(base)
    } else {
        $(this).prepend(base)
    }
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
  listen: listen,
  fromFile: fromFile,
  fromString: fromString,
  readFile: readFile,
  addStatic: addStatic,
  addRoute: addRoute,
  getRoute: getRoute,
  routes: routes,
  params: params,
  modules: modules,
  jq: jq,
  $: $
};

require('./cmd/init.js')(wbn)
require('./wbroute')(wbn);
module.exports = wbn;
