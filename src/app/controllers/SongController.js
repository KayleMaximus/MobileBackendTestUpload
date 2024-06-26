require("dotenv").config();
const { db, storage } = require("../../config/db/firebase");
const { google } = require("googleapis");
const stream = require("stream");
const { authorize } = require("../../config/db/googleDrive");
const fs = require("fs");
const mm = require("music-metadata");
const { v4: uuidv4 } = require("uuid");
const Song = require("../models/Song");
const sqlite = require("../../config/db/sqliteCloud");
const axios = require("axios");
const {addSongToListSong} = require('../utils/artist');
const sendNotification = require("../utils/notification");
const redisClient = require('../../config/redis')

const getSongBySongID_API_URL = process.env.API_URL + "songs/songID";
const cacheKey = 'all-songs';
const cacheKeyArtist = 'all-artists';

class SongController {
  //[GET] /user
  async index(req, res, next) {
    const list = [];
    await db
      .collection("songs")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const songData = doc.data();
          const song = new Song(
            songData.songID,
            songData.name,
            songData.artist,
            songData.genre,
            songData.album,
            songData.views,
            songData.createdAt,
            songData.songURL,
            songData.imageURL
          );
          list.push(song);
        });
      });
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(list));
      res.send(list);
  }

  //[POST]
  async create(req, res) {
    const { name, artist, genre, album, views } = req.body;
    const songFile = req.file;

    try {
      // Authentication with gg drive
      const authClient = await authorize();
      const drive = google.drive({ version: "v3", auth: authClient });

      // Handle songURL, save it in drive
      const fileMetaData = {
        name: name,
        //parents: ["1BHXt7gFyOVyZ08yPwdk7dOhhIuAkdepv"], // A folder ID to which file will get uploaded
        parents: ["1TafzkI_G7A9DBIg-zzztYo8PrzQopFN6"], // A folder ID to which file will get uploaded
      };

      const media = {
        mimeType: "audio/mpeg",
        body: new stream.PassThrough().end(songFile.buffer), // Đọc dữ liệu từ tệp MP3
      };

      const response = await drive.files.create({
        resource: fileMetaData,
        media: media,
        fields: "id",
      });

      const songID = response.data.id;
      await drive.permissions.create({
        fileId: songID,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      const songUrl = `https://drive.google.com/uc?id=${songID}&export=download`;
      // Done it

      // Handle Thumbnail, save it in firebase
      const metadata = await mm.parseBuffer(songFile.buffer);

      let imageURL = "";

      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const imageBuffer = Buffer.from(metadata.common.picture[0].data);
        const imageName = `${name}_thumbnail.jpg`;

        const destinationFileName = "images/" + imageName;

        await storage.bucket().file(destinationFileName).save(imageBuffer, {
          contentType: "image/jpeg",
        });

        const fileURL = await storage
          .bucket()
          .file(destinationFileName)
          .getSignedUrl({
            action: "read",
            expires: "01-01-3000",
          });

        imageURL = fileURL.toString();
      }
      // Done it

      //create prop createdAt
      const createdAt = new Date().toISOString().split("T")[0];

      // create object Song
      const newSong = new Song(
        songID,
        name,
        artist,
        genre,
        album,
        views,
        createdAt,
        songUrl,
        imageURL
      );

      try {
        await db.collection("songs").add({
          songID: newSong.songID,
          name: newSong.name,
          artist: newSong.artist,
          genre: newSong.genre,
          album: newSong.album,
          views: newSong.views,
          createdAt: newSong.createdAt,
          songURL: newSong.songURL,
          imageURL: newSong.imageURL,
        });

        redisClient.del(cacheKey, (err, response) => {
          if (err) throw err;
          console.log(`Cache key ${cacheKey} deleted`);
        });
      } catch (error) {
        console.log(error)
      }

      try {
        addSongToListSong(newSong.artist, newSong.name);
        redisClient.del(cacheKeyArtist, (err, response) => {
          if (err) throw err;
          console.log(`Cache key ${cacheKey} deleted`);
        })
      } catch (error) {
        console.log(error)
      }
      sendNotification("media", newSong);

      res.status(201).send("Song created successfully");
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }

  async update(req, res) {
    const songID = req.params.songID;
    const { name, artist, genre, album } = req.body;

    // Tạo một object JSON chứa các trường cần cập nhật
    const updatedData = {};

    if (name) updatedData.name = name;
    if (artist) updatedData.artist = artist;
    if (genre) updatedData.genre = genre;
    if (album) updatedData.album = album;

    try {
      // Tìm tài liệu có trường id phù hợp
      const songRef = db.collection("songs").where("songID", "==", songID);
      const mySong = await songRef.get();

      if (mySong.empty) {
        res.status(404).send("Song not found");
        return;
      }

      // Cập nhật chỉ các trường đã được cung cấp trong updatedData
      const doc = mySong.docs[0];

      try {
        await doc.ref.update(updatedData);
        redisClient.del(cacheKey, (err, response) => {
          if (err) throw err;
          console.log(`Cache key ${cacheKey} deleted`);
        });
      } catch (error) {
        console.log(error)
      }

      res.status(200).send("Song updated successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
      res.status(500).send("Internal Server Error");
    }
  }

  async delete(req, res) {
    try {
      const songID = req.params.songID;

      const songRef = db.collection("songs").where("songID", "==", songID);
      const mySong = await songRef.get();

      if (mySong.empty) {
        res.status(404).send("User not found");
        return;
      }

      const doc = mySong.docs[0];
      
      try {
        await doc.ref.delete();
        redisClient.del(cacheKey, (err, response) => {
          if (err) throw err;
          console.log(`Cache key ${cacheKey} deleted`);
        });
      } catch (error) {
        console.log(error)
      }

      res.status(200).send("Song deleted successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
      res.status(500).send("Internal Server Error");
    }
  }

  //[GET] /nameArtist
  async getSongByArtistName(req, res, next) {
    const nameArtist = req.query.nameArtist;
    let list = [];

    await db
      .collection("songs")
      .where("artist", "==", nameArtist)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const songData = doc.data();
          const song = new Song(
            songData.songID,
            songData.name,
            songData.artist,
            songData.genre,
            songData.album,
            songData.views,
            songData.createdAt,
            songData.songURL,
            songData.imageURL
          );
          list.push(song);
        });
      })
      .catch(next);
    res.send(list);
  }

  //[GET] /nameAlbum
  async getSongByAlbumName(req, res, next) {
    const nameAlbum = req.query.nameAlbum;
    let list = [];

    await db
      .collection("songs")
      .where("album", "==", nameAlbum)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const songData = doc.data();
          const song = new Song(
            songData.songID,
            songData.name,
            songData.artist,
            songData.genre,
            songData.album,
            songData.views,
            songData.createdAt,
            songData.songURL,
            songData.imageURL
          );
          list.push(song);
        });
      })
      .catch(next);
    res.send(list);
  }

  async getSongByGenreName(req, res, next) {
    const nameGenre = req.query.nameGenre;
    let list = [];

    await db
      .collection("songs")
      .where("genre", "==", nameGenre)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const songData = doc.data();
          const song = new Song(
            songData.songID,
            songData.name,
            songData.artist,
            songData.genre,
            songData.album,
            songData.views,
            songData.createdAt,
            songData.songURL,
            songData.imageURL
          );
          list.push(song);
        });
      })
      .catch(next);
    res.send(list);
  }

  async getSongBySongID(req, res, next) {
    const songID = req.query.songID;
    let song;
    await db
      .collection("songs")
      .where("songID", "==", songID)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const songData = doc.data();
          song = new Song(
            songData.songID,
            songData.name,
            songData.artist,
            songData.genre,
            songData.album,
            songData.views,
            songData.createdAt,
            songData.songURL,
            songData.imageURL
          );
        });
      })
      .catch(next);
    res.send(song);
  }

  async getSongBySongName(req, res, next) {
    const songName = req.query.songName;
    let song;
    await db
      .collection("songs")
      .where("name", "==", songName)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const songData = doc.data();
          song = new Song(
            songData.songID,
            songData.name,
            songData.artist,
            songData.genre,
            songData.album,
            songData.views,
            songData.createdAt,
            songData.songURL,
            songData.imageURL
          );
        });
      })
      .catch(next);
    res.send(song);
  }

  async getRecentSongByUserID(req, res, next) {
    const listSongID = req.listSongID;

    let listSong = [];

    try {
      const songPromises = listSongID.map(async (item) => {
        try {
          const song = await axios.get(
            `${getSongBySongID_API_URL}?songID=${item}`
          );

          const songData = song.data;

          listSong.push(songData);
        } catch (error) {
          console.error("Error:", item, error);
        }
      });

      await Promise.all(songPromises);

      res.send(listSong);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getRecommendSongByUserID(req, res, next) {
    // Function này chỉ việc nhận và res.send thôi, còn lại middleware đã làm hết rồi
    let result = req.result;

    res.send(result);
  }

  async getForgotenFavoriteSongByUserID(req, res, next) {
    // Function này chỉ việc nhận và res.send thôi, còn lại middleware đã làm hết rồi
    const result = req.result;

    res.status(200).send(result);
  }

  async getSongFromSQLite(req, res, next) {
    console.log("toidayroi");

    let results = await sqlite.sql`SELECT * FROM "songs"`;

    res.send(results);
  }
}

module.exports = new SongController();
