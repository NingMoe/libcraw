var WechatAPI = require('wechat-api');
var api = new WechatAPI('wx6fc4d11bf181a100','dfec253e1e3f8e5226e3067ed9177826');
var id = '';
var util = function(){
    create_Menu();
}

function create_Menu(){
    var menu = {
        "button":[
            {
                "name":"��ѯ",
                "sub_button":[{
                    "name":"GPA",
                    "type":"click",
                    "key":"get_GPA"
                },
                    {
                        "name":"�γ̱�",
                        "type":"click",
                        "key":"get_SCHEDULE"
                    }]
            },
            {
                "name":"��",
                "type":"view",
                "url":"http://ec2-54-84-201-78.compute-1.amazonaws.com/login.html",
                "key":"login"
            }
            //{
            //    "name":"MUSTBEE",
            //    "type":"media_id",
            //    "media_id":id
            //}
        ]
    }

    api.createMenu(menu,function(err,result){
        if(err){
            console.log(err);
        }
        console.log(result.errcode + result.errmsg);
    })
}


module.exports = util;