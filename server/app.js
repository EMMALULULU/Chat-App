const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
// const cors = require('cors');
const router = require('./router');

const app = express();
const httpServer = http.createServer(app);
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');
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
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  // server expect event
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('message', {
        user: 'admin',
        text: `${user.name} has left`,
      });
    }
  });
});

app.use(router);
httpServer.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
