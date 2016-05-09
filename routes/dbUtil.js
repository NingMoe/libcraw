var MongoClient = require('mongodb').MongoClient;
var dbPath = 'mongodb://localhost:27017/students';

var cheerio = require('cheerio');
var url = 'https://coes-stud.must.edu.mo/coes/login.do';

var dbUtil = function(){
    this.stuInfoLogin = function(value,msg,wechat){
        var request = require('request');
        var stuID = value.split(' ')[0];
        var stuPWD = value.split(' ')[1];
        var openID = msg.toUserName;

        //validate whether the student info are correct
        var resMsgContent = '';

        request(url,callback1);

        function callback1(err,res,body){
            if(!err && res.statusCode == 200){
                var $ = cheerio.load(body,{normalizeWhitespace: true});
                var token = $('input[name="org.apache.struts.taglib.html.TOKEN"]').attr('value');
                console.log('token: '+ token);

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
                        'org.apache.struts.taglib.html.TOKEN':token
                    },
                    jar:true

                }


                request.post(options,callback);

            }
        }

        function callback(err, res, body){

            if(!err && res.statusCode === 200){
                var $ = cheerio.load(body,{normalizeWhitespace: true});
                var index = $('title').text().indexOf('Inbox');
                if(index!=-1){

                    request.get({
                        url:'https://coes-stud.must.edu.mo/coes/logout.do',
                        jar:true
                    })
                    resMsgContent = '您已成功绑定学生卡号信息';
                    dbConnection(dbPath,stuID,stuPWD,openID);
                    wechatSendMsg(msg,resMsgContent,wechat);
                }else{
                    request.get({
                        url:'https://coes-stud.must.edu.mo/coes/logout.do',
                        jar:true
                    })
                    resMsgContent = '绑定失败，可能由以下原因之一造成绑定失败\n' +
                        '【1】学生卡号、密码不正确\n' +
                        '【2】此学生卡号并未正常退出选课系统\n' +
                        '【3】卡号密码中间没有由空格隔开如\"【绑定】1409853G-A123-B4567 12345678\"';
                    wechatSendMsg(msg,resMsgContent,wechat);
                }


            }
        }


    }
};

function dbConnection(dbPath,stuID,stuPWD,openID){
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

function wechatSendMsg(msg,resMsgContent,wechat){
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
