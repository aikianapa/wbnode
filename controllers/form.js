module.exports = function(req,res) {
    var wbn = req.wbn;
    var $str;
    //console.log(wbn.params,wbn.route);

    if (wbn.params.start && wbn.route.form == "pages" && wbn.route.item == "home") {
        $str = wbn.fromFile(wbn.params.start)
    } else {
        $str = wbn.fromString(wbn.route.form)
    }

    if ($str.Error) {
        req.html("Error: start page" + $str.Error.path + " not found!")
        throw("Error")
    }
//    $str.find("li").after("<li>meta {{test}} name='{{multi.7}}' </li>\n")
    //  $.end(result) // -> 25
//    $str.data("data", {test:"erqwerqwer",multi:{m1:"m111111",7:"m2222222"}})
    $str.fetch()
    res.html($str.html())
    res.end();
}
