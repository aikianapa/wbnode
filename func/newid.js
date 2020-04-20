module.exports = function (separator, prefix) {
        if (separator == undefined) separator = "";
        if (prefix == undefined) prefix = "id";
        var mt = (microtime()+"").split(" ");
        var md = dechex(mt[0]*10000);
        var id = dechex(mt[1]*1);
        if (prefix !== undefined && prefix > "") {
          id = prefix + separator + id + md;
        } else {
          id = id + separator + md;
        }
        id = id.split(".");
        return id[0];
}
