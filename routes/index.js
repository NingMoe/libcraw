var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var dbPath = 'mongodb://54.84.201.78:27017/students';

router.get('/hello',function(req,res,next){
    res.render('hello',{});
    res.end();
})
/* GET home page. */
router.post('/login', function(req, res, next) {

  var data = req.body;
  var studentID = data.studentID;
  var pwd = data.pwd;

  console.log(studentID);
  console.log(pwd);

  MongoClient.connect(dbPath,function(err,db){
    if(!err){
      var stubd = db.collection('student');
      console.log('successfully connected to localhost database');

      if(stubd.find({"studentID":studentID})!=null){
        stubd.update({"studentID":studentID},{"$set":{"pwd":pwd}},true);
        console.log('pwd successfully changed');
      }else{
        stubd.insertOne({"studentID":studentID,"pwd":pwd});
        console.log('successfully inserted');
      }

      db.close();
    }
  })
  res.send(JSON.stringify(req.body));
  res.end();
  //res.render('index', { title: 'Express' });
});

module.exports = router;
