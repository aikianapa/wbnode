module.exports = function(req,res) {
    $jq = req.wbn.fromFile(`${req.route.path_mod}/template/dashboard.html`)
    if (!$jq.find("base").length) $jq.base(`${req.route.base_mod}/template/`)
    $jq.fetch()
    res.html($jq.html())
}
