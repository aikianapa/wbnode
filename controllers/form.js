module.exports = function(req) {
    var wbn = req.wbn;
    let $str = wbn.fromFile(wbn.params.start)
    if ($str.Error) {
        req.html("Error: start page" + $str.Error.path + " not found!")
        throw("Error")
    }
    $str.find("li").after("<li>meta {{test}} name='{{multi.7}}' </li>\n")
    //  $.end(result) // -> 25
    $str.data("data", {test:"erqwerqwer",multi:{m1:"m111111",7:"m2222222"}})
    $str.fetch()
    req.html($str.html())
}
