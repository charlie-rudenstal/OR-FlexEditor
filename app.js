// Started 18.30

var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , path = require('path')
  , io = require('socket.io').listen(server);

app.configure(function(){
  app.set('port', process.env.PORT || 3001);
  app.set('views', __dirname + '/views');
  app.use(express.static(path.join(__dirname, 'public')));
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var connectionCount = 0;

// Socket for real time preview in iphone/device
io.sockets.on('connection', function (socket) {
 	connectionCount++;
 	io.sockets.emit('connection-count', connectionCount);
	
	socket.on('change', function (exportedData) {
		io.sockets.emit('change', exportedData)
 	});

 	socket.on('background', function (hexColor) {
		io.sockets.emit('background', hexColor)
 	});

 	socket.on('disconnect', function() {
 		connectionCount--;
 		io.sockets.emit('connection-count', connectionCount);
 	})

});