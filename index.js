
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const { on } = require('events');
const { emit } = require('process');
const indexPage = fs.readFileSync(`${__dirname}/src/Room_chat.html`)
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const mysql = require('mysql');
const nameSpace = io.of('/chat')
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Ninjaarm-2003",
  database: "room_chat"
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected database!");
});

app.get('/chat', (req, res) => {
  res.end(indexPage);
});

nameSpace.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('join', (inputRoom, inputName, inputId) => {
    
    con.query("select PersonId from Persons;", function (err, result) {
      if (err) throw err;
      let check = 0;
      for (x in result) {
        if (inputId == x) {
          check++;
        }
      }
      if (check == 0) {
        con.query(`INSERT INTO Persons (PersonID, Name, RoomId) VALUES ('${inputId}', '${inputName}', '${inputRoom}');`, function (err, result) {
          if (err) throw err;
          socket.join(inputRoom);
          nameSpace.to(inputRoom).emit('success_room', inputName + ' join the room');
        });
      }
    });


  });
  socket.on('chat message', (data) => {
    nameSpace.to(data.room).emit('chat message', data.nameU, data.message);
  });
  socket.on('quit',(name,room)=>{
    nameSpace.to(room).emit('someoneQuit', name +' leave the room.');
    console.log(name +' leave the room.')
  })



});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
