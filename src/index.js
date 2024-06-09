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

io.on('connection', (socket) => {
  console.log("User connected");

  socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`User joined room ${room}`);
  });

  // socket.on('sendMessage', (room, message) => {
  //     io.to(room).emit('message', message);
  // });

  // socket.on('on-chat', data => {
  //     io.emit('user-chat', data)
  // })

  socket.on('on-chat', data => {
    io.to(data.room).emit('user-chat', data.message);
});

  socket.on('disconnect', () => {
      console.log('User disconnected');
  });
})

server.listen(port, () => console.log(`Server has started on ${port}`));

