module.exports = function(Wbn) {
  Wbn.addRoute("/module/:load/*", {controller:'module'} ,"module")
  Wbn.addRoute("/ajax/*", {controller:'ajax'},"ajax")
  Wbn.addRoute("/api/:mode/:table/*", {controller:'api'},"api")
  Wbn.addRoute("/",{controller:'form', mode:'show', form:'pages', item:'home'},"home")
  Wbn.addRoute("/:item/", {controller:'form', mode:'show', form:'pages', item:'$1'},"pages")
}
