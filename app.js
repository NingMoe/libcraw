var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var wechat = require('weixin-api');

var routes = require('./routes/index');
//var users = require('./routes/users');
//var crawler = require('./routes/crawler');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.set('port',process.env.PORT || 3000);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
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

  var booktitle = msg.content;
  crawler(booktitle,msg);


})

var crawler = function(msgContent,msg) {
  var queryContents = {
    searchtype: 'X',
    SORT: 'D',
    searcharg: msgContent
  };
  var MsgContent = "";
  var url = "https://library.must.edu.mo/search/?" + querystring.stringify(queryContents);

  console.log(url);

  request(url, callback);

  function callback(err, res, body) {
    var resMsgContent = "";
    if (!err && res.statusCode == 200) {
      var $ = cheerio.load(body, {normalizeWhitespace: true});
      //$('.briefcitDetail').each(function(){
      //    console.log($(this).find('.briefcitDetailMain').html().split('<br>')[2]);
      //})
      var bookitems = [];

      $(".briefcitDetail").each(function () {
        var bookItem = {
          title: '',
          author: '',
          public: '',
          copies: []
        };

        bookItem.title = $(this).find('.briefcitTitle a').text();
        bookItem.author = $(this).find('.briefcitDetailMain').html().split('<br>')[1];

        bookItem.public = $(this).find('.briefcitDetailMain').html().split('<br>')[2];

        var copies = $(this).find('.bibItemsEntry').each(function () {

          var bookCopy = {
            location: '',
            callNo: '',
            status: ''
          };

          var bookcopyitem = $(this).find('td');

          bookCopy.location = bookcopyitem.eq(0).text();
          bookCopy.callNo = bookcopyitem.eq(1).text();
          bookCopy.status = bookcopyitem.eq(2).text();

          bookItem.copies.push(bookCopy);

        })

        bookitems.push(bookItem);

      })

      for(var i = 0; i < 6; i++){
        //console.log(JSON.stringify(elem) + "\n");
        var elem = bookitems[i];
        var copiesInfo = "";
        elem.copies.forEach(function (copy) {
          copiesInfo += copy.location + "\n" + copy.callNo + "\n" + copy.status + "\n";
        })
        copiesInfo +="\n";

        resMsgContent += elem.title + "\n" + elem.author + "\n" + copiesInfo;

      }
      resMsgContent += "更多资讯请进入图书馆官网查看：" + "https://library.must.edu.mo/search/?" + querystring.stringify(queryContents);
      console.log(resMsgContent);

      var resMsg = {
        fromUserName : msg.toUserName,
        toUserName : msg.fromUserName,
        msgType : "text",
        content : resMsgContent,
        funcFlag : 0
      }

      wechat.sendMsg(resMsg);
    }
  }

}


module.exports = app;
