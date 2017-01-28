const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const players = require('./Players')
const routes = require('./routes');

const playerInstance = new players();

// mongoose.connect('mongodb://localhost/hacker-news');

app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '..', 'build')));
}

app.get('/api/players/:isNewPlayer', (req, res) => {
  if (req.params.isNewPlayer === 'true' && playerInstance.players.length >= 2) {
    playerInstance.clearPlayers();
  }
  res.json(playerInstance.players);
});

// app.use('/', routes);

// Catch everything that isn't in routes and send
// to client so react-router can handle it
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
  });
}

io.on('connection', client => {
  client.on('new player', function(data) {
    if (playerInstance.players.length >= 2) {
      playerInstance.clearPlayers();
    } else if (playerInstance.players.length === 1) {
      this.emit('new enemy', playerInstance.players[0]);
    }
    let newPlayer = playerInstance.addPlayer(data);
    // var newPlayer = playerInstance.addPlayerAndAssignRole(this.id);
    console.log(newPlayer);
    this.emit('new player added', newPlayer);
    this.broadcast.emit('new enemy', newPlayer);
  });
  client.on('disconnect', function(data) {
    console.log('ID:', this.id);
    playerInstance.removePlayerById(this.id);
    console.log('disconnected');
  });
  client.on('eat', function(data) {
    console.log("somthing was eaten", data);
    this.broadcast.emit('eat', data);
  });
  client.on('forge', function(data) {
    console.log("somthing was forged", data);
    this.broadcast.emit('forge', data);
  });
  client.on('move', function(data) {
    var moves = data;
    var updatedObj = playerInstance.updatePlayers(moves);
    var killed = playerInstance.detectPlayersCollision();
    this.broadcast.emit('move', updatedObj);
    // console.log('updated players array', playerInstance.players);
    // console.log("KILLED VAR: ", killed);
    if (killed) {
      playerInstance.clearPlayers();
      io.emit('player killed');
    }
  });
  client.on('switch', function(){
    playerInstance.reverseIsHunted();
    console.log('player array after switch.....', playerInstance.players);
    this.emit('switch');
    this.broadcast.emit('switch');
  })
});

module.exports = server;
