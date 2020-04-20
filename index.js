const Wbn = require('./wbnode')

Wbn.addStatic("/static")
Wbn.addRoute("/",{controller:'form',table:'pages',item:'home'})
Wbn.addRoute("/:table/:mode/", {controller:'form'})
Wbn.addRoute("/ajax:controller/:mode/", {controller:'ajax'},'ajaxRoute')
//Wbn.addRoute("/api/:table/:item/(.*)",{controller:'$1',table:'$2',item:'$3'});

Wbn.addRoute("/api/:table/:item/*",{controller:'$1', par2:'$2',item:'$3'},"apiRoute");

var App = Wbn.listen(8000,{start:"./index.html"});

tableCreate("test")
let item = {name:"Oleg1111",age:12,_id:"test1"}
var res = itemSave("test",item,function(err){
  tableFlush("test")
  console.log(err);
})
res = itemRead("test","test1",function(err,item){
  console.log(item);
})
