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

const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const route = require("./routes");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
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

  //hadnle create room
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

  // handle message
  socket.on("user-message", (data) => {
    io.to(data.roomID).emit("on-user-message", data.message);
    console.log(`In ra đối tượng cho pussyK xem: ${data.message}`)
  });

  // handle play song
  socket.on("on-add-song", (data) => {
    io.to(data.roomID).emit("on-song-added", data.song);
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} has disconnected`);
    io.emit("on-user-disconnect", socket.id); // Notify other clients about the disconnection
    //socket.broadcast.emit("on-user-disconnect", socket.id);
  });
});

server.listen(port, () => console.log(`Server has started on ${port}`));
