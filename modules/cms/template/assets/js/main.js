var api = "https://api.feedbackcloud.ru";
var appdata = {
  api: api,
  users: [],
  user: {name:"Oleg Frolov"},
  test: []
};
$.get(api+'/query/users',function(res){
    appdata.users = Object.keys(res).map(function(key){
        return res[key]; // переводим {} в []
    });
});

function CBformContacts(params,data) {
    if (wbapp.mongodbError(data)) {
        params.error = true;
    } else {
        console.log(params);
        switch (params._trigger) {
          case "newitem":
            params = JSON.parse(str_replace("_new","'"+data._id+"'",JSON.stringify(params)));
            break;
          case "remove":
            $(document).find("[data-binded=contactInfo]").remove();
            break;
        }
    }
    return params;
}

$(document).on("ajax-done",function(){
    setTimeout(function(){feather.replace();},100)
})
