var MongoClient = require('mongodb').MongoClient;
var dbPath = 'mongodb://localhost:27017/students';

var dbUtil = {
    stuInfoLogin : function(value,msg,wechat){
        var stuID = value.split(' ')[0];
        var stuPWD = value.split(' ')[1];
        var openID = msg.toUserName;


        MongoClient.connect(dbPath,function(err,db){
            if(!err){
                var stubd = db.collection('student');
                console.log('successfully connected to localhost database');


                if(stubd.find({"openID":openID}).hasNext()){
                    stubd.update({"openID":openID},{"$set":{"studentID":stuID,"pwd":stuPWD}},true);
                    console.log('pwd successfully changed');
                }else{
                    stubd.insert({"openID":openID,"studentID":stuID,"pwd":stuPWD});
                    console.log('successfully inserted');
                }

                db.close();
            }
        })

        var resMsg = {
            fromUserName: msg.toUserName,
            toUserName: msg.fromUserName,
            msgType: "text",
            content: '您已成功绑定学生信息',
            funcFlag: 0
        }

        wechat.sendMsg(resMsg);
    }
};

module.exports = dbUtil;