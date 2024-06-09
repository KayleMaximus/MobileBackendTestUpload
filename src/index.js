const { db, storage } = require("./config/db/firebase.js");
const { v4: uuidv4 } = require("uuid");
const path = require("path")
const express = require("express");
const morgan = require("morgan");
const handlebars = require("express-handlebars");
const multer = require("multer");
const { FieldValue } = require("firebase-admin/firestore");
const cors = require('cors');
require('dotenv').config();

const app = express();

const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

const route = require('./routes')


app.use(cors());  
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(morgan('combined')); //HTTP logger
 //Template Engine
app.engine('hbs', handlebars.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

const port = process.env.PORT || 8383;
route(app);

let rooms = {}; // Object to store rooms and their users

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on('requestRoomList', () => {
    socket.emit('roomList', Object.keys(rooms));
  });

  socket.on("createRoom", (roomName) => {
    console.log(`Creating room: ${roomName}`);
    if (!rooms[roomName]) {
      rooms[roomName] = [];
      socket.join(roomName);
      rooms[roomName].push(socket.id);
      io.to(roomName).emit("roomCreated", roomName);
      io.emit("roomList", Object.keys(rooms));
    } else {
      console.log(`Room ${roomName} already exists`);
    }
  });

  socket.on("joinRoom", (roomName) => {
    console.log(`Joining room: ${roomName}`);
    if (rooms[roomName]) {
      socket.join(roomName);
      rooms[roomName].push(socket.id);
      io.to(roomName).emit("userConnected", {
        id: socket.id,
        users: rooms[roomName],
      });
    } else {
      console.log(`Room ${roomName} does not exist`);
    }
  });

  socket.on("message", (data) => {
    console.log(`Message received in room ${data.room}: ${data.message}`);
    io.to(data.room).emit("message", data.message);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    for (let room in rooms) {
      rooms[room] = rooms[room].filter((id) => id !== socket.id);
      if (rooms[room].length === 0) {
        delete rooms[room];
        io.emit("roomList", Object.keys(rooms));
      } else {
        io.to(room).emit("userDisconnected", {
          id: socket.id,
          users: rooms[room],
        });
      }
    }
  });
});



app.listen(port, () => console.log(`Server has started on ${port}`));
