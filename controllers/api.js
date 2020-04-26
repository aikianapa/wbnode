module.exports = function(req,res) {
  var result = false
  var table = req.route.table

  var result_out = function(result) {
      result = JSON.stringify(result)
      res.header('Access-Control-Allow-Headers', '*');
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods','*');
      res.header('Content-type', 'application/json; charset=utf-8');
      res.end(result)
  }

  var prep_query = function(query) {
      if (typeof query == "string") {
            query = query.split("?")
            if (query[1] !== undefined) {
                let list = query[1].split("&");
                let item;
                query = {};
                for(var key in list) {
                    item = list[key].split("=");
                    query[item[0]] = item[1];
                }
            } else {
                query = {};
            }
      }

      for(var key in query) {
          let val = query[key]
          if (val.substr(-1) == "]" && val.substr(0,1) == "[") {
              // считаем что в val массив и разбтраем его
              val = val.substr(1,val.length -2).split(",");
              switch (key.substr(-1)) {
                  default:
                      query[key] = { $in: val }
                  case '!':
                      delete query[key];
                      query[key.substr(0,key.length -1)] = { $nin: val }
                      break;
              }
          } else {

                switch (key.substr(-1)) {
                  case '<': // меньше (<)
                        query[key.substr(0,key.length -1)] = {$lte:val}
                        delete query[key]
                        break;
                  case '>': // больше (>)
                        query[key.substr(0,key.length -1)] = {$gte:val}
                        delete query[key]
                        break
                  case '"': // двойная кавычка (") без учёта регистра
                        var regex = new RegExp(["^", val, "$"].join(""), "i");
                        query[key.substr(0,key.length -1)] = regex
                        delete query[key]
                        break
                  case '*':
                        var regex = new RegExp(val, "i");
                        query[key.substr(0,key.length -1)] = regex
                        delete query[key]
                        break;
                  case '!':
                        query[key.substr(0,key.length -1)] = {$ne:val}
                        delete query[key]
                        break;
                }
          }
      }

      return query;
  }
  var api_query = function(req,res) {
      var query = prep_query(req.route.query)
      tableQuery(table,query,function(err,docs){
          result_out(docs)
      })
  }
  var api_read = function(req,res) {
      var id = req.route.params[3]
      itemRead(table,id,function(err,item){
          result_out(item)
      })
  }
  var api_update = function(req,res) {
    var id = req.route.params[3]
    var item = req.route.query
    item._id = id
    itemRead(table,id,function(err,check){
        if (err == null && !check) {
            console.log(`Item ${id} is not exists in table ${table}`)
            result_out(false)
        } else {
          itemSave(table,item,function(err,updated){
              result_out(updated)
          })
        }
    })

  }
  var api_create = function(req,res) {
    var id = req.route.params[3]
    var item = req.route.query
    item._id = id
    itemRead(table,id,function(err,check){
        if (err == null && check) {
            console.log(`Item ${id} is exists in table ${table}`)
            result_out(false)
        } else {
          itemSave(table,item,function(err,updated){
              result_out(updated)
          })
        }
    })
  }
  var api_remove = function(req,res) {
      var id = req.route.params[3]
      itemRemove(table,id,function(err,removed){
          result_out(removed)
      })
  }
  var api_auth = function(req,res) {
      if (req.route.method == "GET") {
        let html = "<form method='post'><input name='login'><input name='password'><button>login</button></form>"
        res.html(html)
      } else if (req.route.method == "POST") {
        var type = req.route.params[2]
        var query = {}
        query[type] = req.route._post.login
        query['password'] = md5(req.route._post.password)
        query = prep_query(query)
        itemRead('users',query,function(err,item){

            result_out(item)
        })
      }
  }

  var func = `api_${req.route.mode}`

  if (eval(`typeof ${func} == 'function'`)) {
    eval (`var result = ${func}(req,res)`)
  }


}
