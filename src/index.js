const { db, storage } = require("./config/db/firebase.js");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const handlebars = require("express-handlebars");
const multer = require("multer");
const { FieldValue } = require("firebase-admin/firestore");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require('body-parser');

const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const route = require("./routes");

app.use(
  cors({
    //origin: "http://localhost:3000",
    origin: "https://chill-music-corner-admin-ui.onrender.com",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(morgan("combined")); //HTTP logger
//Template Engine
app.engine("hbs", handlebars.engine({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources", "views"));

const port = process.env.PORT || 8383;
route(app);

io.on("connection", (socket) => {
  console.log(`User with socketID: ${socket.id} connected`);

  //////////////////////////////////// ------------Room---------------///////////////////////////

  socket.on("create-room", (data) => {
    socket.join(data.roomID);
    io.to(data.roomID).emit("on-create-room", data.roomID);
    io.to(data.roomID).emit("on-join-room", data.userName);
    console.log(`User joined room ${data.roomID}`);
  });

  //handle join room
  socket.on("join-room", (data) => {
    socket.join(data.roomID);
    socket.to(data.roomID).emit("on-get-room-info", data.userName, data.userID);
    //io.to(data.roomID).emit("on-get-room-info", data.userName);
    console.log(
      `User ${data.userName}  asking room ${data.roomID} and waiting for response`
    );
  });

  socket.on("respone-room-info", (data) => {
    socket.join(data.roomID);
    //socket.to(data.roomID).emit("on-respone-room-info", data.roomInfo); // notify all clients execpt sender (host)
    io.to(data.roomID).emit("on-respone-room-info", data.roomInfo);
    console.log(`response from ${data.roomID} : ${data.roomInfo}`);
  });

  socket.on("user-join-room", (data) => {
    socket.join(data.roomID);
    io.to(data.roomID).emit("on-user-join-room", data.userName);
    console.log(`User ${data.userName} joined room ${data.roomID}`);
  });
  //////////////////////////////////// ------------Mesage---------------///////////////////////////

  socket.on("user-message", (data) => {
    io.to(data.roomID).emit("on-user-message", data.message);
    console.log(`In ra đối tượng cho pussyK xem: ${data.message}`)
  });

  //////////////////////////////////// -------------Song---------------///////////////////////////
  socket.on("set-song", (data) => {
    io.to(data.roomID).emit("on-song-set", data.song);
    console.log(`Song ${data.song} is set to room ${data.roomID}`);
  });

  socket.on("add-song", (data) => {
    io.to(data.roomID).emit("on-song-added", data.song);
    console.log(`Song ${data.song} is added to room ${data.roomID}`);
  });

  socket.on("add-song-play-next", (data) => {
    io.to(data.roomID).emit("on-add-song-play-next", data.song);
    console.log(`Song ${data.song} is added to top of playlist in room ${data.roomID}`);
  });

  //////////////////////////////////// -------------Playlist---------------///////////////////////////
  socket.on("add-playlist", (data)=> {
    io.to(data.roomID).emit("on-playlist-added", data.songs);
    console.log(`Playlist ${data.songs} is added to room ${data.roomID}`);
  });

  socket.on("set-playlist", (data)=> {
    io.to(data.roomID).emit("on-playlist-set", data.songs);
    console.log(`Playlist ${data.songs} is set to room ${data.roomID}`);
  });

  socket.on("set-playlist-random", (data)=> {
    const songsArray = data.songs;
    shuffleArray(songsArray);
    io.to(data.roomID).emit("on-playlist-random-set", songsArray);
    console.log(`Playlist ${songsArray} is randomized and added to room ${data.roomID}`);
  });

  socket.on("set-song-queue-index", (data)=>{
    io.to(data.roomID).emit("on-set-song-queue-index", data.index);
    console.log(`Song index ${data.index} is set to room ${data.roomID}`);
  });

  //////////////////////////////////// -------------MediaController---------------///////////////////////////

  socket.on("play-pause", (data) => {
    io.to(data.roomID).emit("on-play-pause", data.isPlaying);
    console.log(`Room ${data.roomID} is playing: ${data.isPlaying}`);
  });

  socket.on("skip-song", (data) => {
    io.to(data.roomID).emit("on-song-skipped", data.roomID);
    console.log(`Room ${data.roomID} skipped a song`);
  });

  socket.on("previous-song", (data) => {
    io.to(data.roomID).emit("on-previous", data.roomID);
    console.log(`Room ${data.roomID} prevised a song`);
  });

  socket.on("song-seek", (data) => {
    // Assuming data contains roomID and position
    io.to(data.roomID).emit("on-song-seeked", data.position);
    console.log(`Room ${data.roomID} seeking to position: ${data.position}`);
  });

  socket.on("set-repeat-mode", (data) => {
    // Assuming data contains roomID and repeatMode
    io.to(data.roomID).emit("on-repeat-mode-set", data.repeatMode);
    console.log(`Room ${data.roomID} set repeat mode to: ${data.repeatMode}`);
});


  socket.on("disconnect", () => {
    console.log(`User ${socket.id} has disconnected`);
    io.emit("on-user-disconnect", socket.id); // Notify other clients about the disconnection
    //socket.broadcast.emit("on-user-disconnect", socket.id);
  });
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

server.listen(port, () => console.log(`Server has started on ${port}`));
