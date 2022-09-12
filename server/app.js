const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
// const cors = require('cors');
const router = require('./router');

const app = express();
const httpServer = http.createServer(app);
const { addUser, removeUser, getUser, getUserInRoom } = require('./users.js');
const { emit } = require('process');
const PORT = process.env.PORT || 4000;

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) {
      return callback(error);
    }

    // fire the event from server
    socket.emit('message', {
      user: 'admin',
      text: `${user.name}, welcome to the room ${user.room} `,
    });
    console.log(user);
    socket.broadcast
      .to(user.room)
      .emit('message', { user: 'admin', text: `${user.name}, has joined!` });

    socket.join(user.room);

    callback();
  });

  // server expect event
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    console.log(message);
    console.log('send message event user room', user.room);
    io.in(user.room).emit('message', { user: user.name, text: message });
    callback();
  });

  socket.on('disconnect', () => {
    console.log('user left');
  });
});

app.use(router);
httpServer.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
