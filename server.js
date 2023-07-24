const express = require('express');
const path = require('path');
const socket = require('socket.io');
const db = require('./db');

const app = express();
const server = app.listen(8000, () => {
  console.log('Server is running on Port:', 8000);
});
const io = socket(server);

io.on('connection', (socket) => {
  console.log('New client! Its id – ' + socket.id);
  socket.on('join', (user) => {
    const newUser = { name: user.user, id: socket.id };
    db.users.push(newUser);
    console.log(db.users);
    socket.broadcast.emit('newUser', newUser);
  });
  socket.on('message', (message) => {
    console.log("Oh, I've got something from " + socket.id);
    db.messages.push(message);
    socket.broadcast.emit('message', message);
  });
  socket.on('disconnect', () => {
    console.log('Oh, socket ' + socket.id + ' has left');
    const userIndex = db.users.findIndex((user) => user.id === socket.id);
    if (userIndex !== -1) {
      socket.broadcast.emit('removeUser', db.users[userIndex]);
      db.users.splice(userIndex, 1);
    }
    console.log(db.users);
  });

  console.log("I've added a listener on message event \n");
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '/client')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found...' });
});
