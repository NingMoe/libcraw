var express = require('express');
var router = express.Router();
var wechat = require('weixin-api');


/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.set('Content-Type','text/plain');
  res.write('this is test');
  res.end();
});

router.get('/hello', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.set('Content-Type','text/plain');
  res.write('this is another test');
  res.end();
});

module.exports = router;
