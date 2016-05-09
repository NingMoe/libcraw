var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var wechat = require('weixin-api');

var routes = require('./routes/index');

var crawler = require('./routes/libCrawler');
var dbUtil = require('./routes/dbUtil');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('port',process.env.PORT || 3000);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/users', users);

app.post('/', function(req, res) {

  wechat.loop(req, res);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var token = "jacelynToken";

wechat.textMsg(function(msg){
  console.log("message received");
  console.log(JSON.stringify(msg));

  var data = msg.content;
  var choice = data.slice(0,4);
  var value = data.substr(4);

  switch(choice){
    case '【图书】':
      crawler(value,msg,wechat);
          break;
    case '【绑定】':
        var dbu = new dbUtil();
        dbu.stuInfoLogin(value,msg,wechat);
          break;
    //case '【GPA】':
    //    dbUtil.gpaQuery(msg,wechat);
    //      break;
    //case '【课表】':
    //    dbUtil.scheduleQuery(msg,wechat);
    //      break;
      case '【用法】':
          wechat.sendMsg({
              fromUserName: msg.toUserName,
              toUserName: msg.fromUserName,
              msgType: "text",
              content: '回复【图书】+书名\n如 \"【图书】javascript\"查询相关图书\n------\n' +
              '回复 【绑定】+学生卡号+空格+学生卡号密码\n如 \"【绑定】1409853G-A123-B4567 12345678\"' +
              '进行学生卡号绑定以开通查询GPA及课表功能\n------\n' +
              '回复【GPA】\n查询当前学期GPA绩点\n------\n' +
              '回复【课表】\n查询当前学期课程表\n------\n' +
              '回复【取消绑定】\n取消当前账号绑定的学生卡信息\n------\n' +
              '回复【用法】\n获取平台使用指南\n',
              funcFlag: 0
          });
          break;
    default :
        crawler(data,msg,wechat);
        break;
  }


})

wechat.eventMsg(function(msg){
  var eventKey = msg.eventKey;
  var event = msg.event;
  switch(event){
    case 'subscribe':
        var resMsgContent = '感谢关注MUSTBEE微信公众平台\n' +
            '回复【图书】+书名\n如 \"【图书】javascript\"查询相关图书\n------\n' +
            '回复 【绑定】+学生卡号+空格+学生卡号密码\n如 \"【绑定】1409853G-A123-B4567 12345678\"' +
            '进行学生卡号绑定以开通查询GPA及课表功能\n------\n' +
            '回复【GPA】\n查询当前学期GPA绩点\n------\n' +
            '回复【课表】\n查询当前学期课程表\n------\n' +
            '回复【取消绑定】\n取消当前账号绑定的学生卡信息\n------\n' +
            '回复【用法】\n获取平台使用指南\n';
        var resMsg = {
          fromUserName: msg.toUserName,
          toUserName: msg.fromUserName,
          msgType: "text",
          content: resMsgContent,
          funcFlag: 0
        }

        wechat.sendMsg(resMsg);
          break;
    default:
          break;

  }


})


module.exports = app;
