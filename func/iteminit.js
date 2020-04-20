module.exports = function(item) {
    var time = microtime().split(" ")[1];
    if (!item._created) {item._created = date("Y-m-d H:i:s",time)}
    item._updated = date("Y-m-d H:i:s",time)
    if (item._id == undefined || item.id == "" || item._id == "_new" ) item._id = newId()
    return item
}
