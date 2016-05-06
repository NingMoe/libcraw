var MongoClient = require('mongodb').MongoClient;
var dbPath = 'mongodb://localhost:27017/students';
var request = require('request');

var cheerio = require('cheerio');

var dbUtil = {
    stuInfoLogin : function(value,msg,wechat){
        var stuID = value.split(' ')[0];
        var stuPWD = value.split(' ')[1];
        var openID = msg.toUserName;

        //validate whether the student info are correct
        var resMsgContent = '';
        var options = {
            url:url,
            headers:{
                'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding':'gzip, deflate',
                'Accept-Language':'zh-CN,zh;q=0.8',
                'Cache-Control':'max-age=0',
                'Connection':'keep-alive',
                'Content-Type':'application/x-www-form-urlencoded'
            },
            form:{
                'userid':stuID,
                'password':stuPWD,
                'org.apache.struts.taglib.html.TOKEN':'cf4927687538d27dec6289f094dc8004'
            },
            jar:true

        }


        request.post(options,callback);

        function callback(err, res, body){

            if(!err && res.statusCode === 200){
                var $ = cheerio.load(body);
                if($('title').text().slice(-5) == 'Inbox'){

                    request.get({
                        url:'https://coes-stud.must.edu.mo/coes/logout.do',
                        jar:true
                    })
                    resMsgContent = '您已成功绑定学生卡号信息';
                    dbConnection(dbPath);
                    wechatSendMsg(resMsgContent,wechat);
                }else{

                    resMsgContent = '绑定失败，请检查学生卡号、密码是否正确或卡号密码中间是否由空格隔开如\"【绑定】1409853G-A123-B4567 12345678\"';
                    wechatSendMsg(resMsgContent,wechat);
                }


            }
        }

    }
};

function dbConnection(dbPath){
    MongoClient.connect(dbPath,function(err,db){
        if(!err){
            var stubd = db.collection('student');
            console.log('successfully connected to localhost database');


            stubd.find({"openID":openID}).count(function(err,count){

                if(count != 0){
                    stubd.update({"openID":openID},{"$set":{"studentID":stuID,"pwd":stuPWD}},function(err,r){
                        console.log(err);
                        console.log('pwd successfully changed');
                        db.close();
                    });

                }else{
                    stubd.insertOne({"openID":openID,"studentID":stuID,"pwd":stuPWD},function(err,r){
                        console.log(err);
                        console.log('successfully inserted');
                        db.close();
                    });

                }
            })

        }
    })
}

function wechatSendMsg(resMsgContent,wechat){
    var resMsg = {
        fromUserName: msg.toUserName,
        toUserName: msg.fromUserName,
        msgType: "text",
        content: resMsgContent,
        funcFlag: 0
    }

    wechat.sendMsg(resMsg);
}

module.exports = dbUtil;
