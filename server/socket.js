var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', onConnection);

http.listen(3000, function(){
  console.log('listening on *:3000');
});



function onConnection(socket){
  console.log('a user connected');

  let heartbeat = 0;

  setInterval(function () {
    socket.emit('heartbeat', heartbeat++);
  }, 5000)

  socket.on('disconnect', function () {
    console.log('disconnect')
  })

  socket.on('disconnection', function () {
    console.log('disconnection')
  })
}