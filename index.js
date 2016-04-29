var app = require('./app.js');
var http = require('http');

var server = http.createServer(app);
server.listen(app.get('port'));
console.log("server listening on 3000");