module.exports = function(req,res) {
  var load = false
  var eLoad = `${req.route.path_wbn}/modules/${req.route.load}/${req.route.load}.js`
  var aLoad = `${req.route.path_app}/modules/${req.route.load}/${req.route.load}.js`
  if (is_file(aLoad)) {
      load = aLoad
      req.route.base_mod = `/modules/${req.route.load}`
      req.route.path_mod = `${req.route.path_app}/modules/${req.route.load}`
  } else if (is_file(eLoad)) {
      load = eLoad
      req.route.base_mod = `/engine/modules/${req.route.load}`
      req.route.path_mod = `${req.route.path_wbn}/modules/${req.route.load}`
  }
  if (load) {
      var module = require(load)(req,res)
      result.end()
  } else {
      result.status(404)
      result.end("Module not found")
  }
}
