const { db, storage } = require("../../config/db/firebase");
const Album = require("../models/Album");
const Song = require("../models/Song");
const { v4: uuidv4 } = require("uuid");
const generateRandomID = require("../utils/randomID");
const axios = require("axios");

const getSongBySongName_API_URL = process.env.API_URL + "songs/songName";
//const getSongBySongName_API_URL = "http://localhost:8383/" + "songs/songName";

class AlbumController {
  async index(req, res, next) {
    const list = [];
    await db
      .collection("albums")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const albumData = doc.data();
          const album = new Album(
            albumData.albumID,
            albumData.name,
            albumData.artist,
            albumData.imageURL,
            albumData.listSong
          );
          list.push(album);
        });
      })
      .catch(next);

    try {
      const albumPromises = list.map(async (itemAlbum) => {
        console.log(itemAlbum.name);
        let listSong = [];

        try {
          const songPromises = itemAlbum.listSong.map(async (item) => {
            try {
              const song = await axios.get(
                `${getSongBySongName_API_URL}?songName=${item}`
              );

              const songData = song.data;
              console.log(songData);

              listSong.push(songData);
            } catch (error) {
              console.error("Error:", item, error);
            }
          });

          await Promise.all(songPromises);
        } catch (error) {
          console.error("Error fetching user:", error);
          res.status(500).json({ error: "Internal server error" });
        }

        itemAlbum.listSong = listSong;
        
        console.log(listSong);

        });
      await Promise.all(albumPromises);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
    res.send(list);
  }

  async create(req, res) {
    const albumID = generateRandomID(23);
    const { name, artist, listSong } = req.body;
    const file = req.file;
    try {
      const fileName = uuidv4(); // Generate a unique filename using UUID
      const destinationFileName = "images/" + fileName; // Use the generated filename

      await storage.bucket().file(destinationFileName).save(file.buffer, {
        contentType: req.file.mimetype,
      });

      const fileURL = await storage
        .bucket()
        .file(destinationFileName)
        .getSignedUrl({
          action: "read",
          expires: "01-01-3000",
        });

      const newAlbum = new Album(albumID, name, artist, fileURL.toString(), []);

      await db.collection("albums").add({
        albumID: newAlbum.albumID,
        name: newAlbum.name,
        artist: newAlbum.artist,
        imageURL: newAlbum.imageURL,
        listSong: newAlbum.listSong,
      });

      res.status(201).send("Album created successfully");
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }

  async update(req, res) {
    const albumID = req.params.albumID;
    const { name, artist } = req.body;

    // Tạo một object JSON chứa các trường cần cập nhật
    const updatedData = {};

    if (name) updatedData.name = name;
    if (artist) updatedData.artist = artist;

    try {
      // Tìm tài liệu có trường id phù hợp
      const albumRef = db
        .collection("albums")
        .where("albumID", "==", albumID);
      const myAlbum = await albumRef.get();

      if (myAlbum.empty) {
        res.status(404).send("Album not found");
        return;
      }

      // Cập nhật chỉ các trường đã được cung cấp trong updatedData
      const doc = myAlbum.docs[0];
      await doc.ref.update(updatedData);

      res.status(200).send("Album updated successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
      res.status(500).send("Internal Server Error");
    }
  }

  async delete(req, res) {
    try {
      const albumID = req.params.albumID;

      const albumRef = db
        .collection("albums")
        .where("albumID", "==", albumID);
      const myAlbum = await albumRef.get();

      if (myAlbum.empty) {
        res.status(404).send("Album not found");
        return;
      }

      const doc = myAlbum.docs[0];
      await doc.ref.delete();

      res.status(200).send("Album deleted successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
      res.status(500).send("Internal Server Error");
    }
  }

  //[GET] /nameSong
  async getAlbumtBySongName(req, res, next) {
    const nameSong = req.query.nameSong;

    let list = [];

    await db
      .collection("albums")
      .where("listSong", "array-contains", nameSong)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const albumData = doc.data();
          const album = new Album(
            albumData.albumID,
            albumData.name,
            albumData.artist,
            albumData.imageURL,
            albumData.listSong
          );
          list.push(album);
        });
      })
      .catch(next);
    res.send(list);
  }

  //[GET] /nameArtist
  async getAlbumtByArtistName(req, res, next) {
    const nameArtist = req.query.nameArtist;

    let list = [];

    await db
      .collection("albums")
      .where("artist", "==", nameArtist)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const albumData = doc.data();
          const album = new Album(
            albumData.albumID,
            albumData.name,
            albumData.artist,
            albumData.imageURL,
            albumData.listSong
          );
          list.push(album);
        });
      })
      .catch(next);

    res.send(list);
  }

  async getAlbumByAlbumID(req, res, next) {
    const albumID = req.query.albumID;

    let albumData;

    try {
      const albumSnapshot = await db
        .collection("albums")
        .where("albumID", "==", albumID)
        .limit(1)
        .get();

      if (!albumSnapshot.empty) {
        const albumDoc = albumSnapshot.docs[0];
        albumData = albumDoc.data();
      } else {
        console.log("No album found with the given albumID");
      }
    } catch (error) {
      console.error("Error getting album:", error);
    }

    let listSong = [];

    try {
      const songPromises = albumData.listSong.map(async (item) => {
        try {
          const song = await axios.get(
            `${getSongBySongName_API_URL}?songName=${item}`
          );

          const songData = song.data;

          listSong.push(songData);
        } catch (error) {
          console.error("Error:", item, error);
        }
      });

      await Promise.all(songPromises);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }

    albumData.listSong = listSong;

    res.status(200).send(albumData);
  }

  async getAlbumByAlbumName(req, res, next) {
    const albumName = req.query.albumName;
    let album;
    await db
      .collection("albums")
      .where("name", "==", albumName)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const albumData = doc.data();
          album = new Album(
            albumData.albumID,
            albumData.name,
            albumData.artist,
            albumData.imageURL,
            albumData.listSong,
          );
        });
      })
      .catch(next);
    res.send(album);
  }

  async getListSongByAlbumID(req, res, next) {
    const albumID = req.query.albumID;
    let album;
    await db
      .collection("albums")
      .where("albumID", "==", albumID)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const albumData = doc.data();
          album = new Album(
            albumData.albumID,
            albumData.name,
            albumData.artist,
            albumData.imageURL,
            albumData.listSong,
          );
        });
      });

    const listSong = [];

    if (album.listSong.length > 0) {
      try {
        const songPromises = album.listSong.map(async (item) => {
          try {
            const song = await axios.get(
              `${getSongBySongName_API_URL}?songName=${item}`
            );
            const songData = song.data;

            listSong.push(songData);
          } catch (error) {
            console.error("Error:", item, error);
          }
        });
        await Promise.all(songPromises);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    }

    res.status(200).send(listSong);
  }
}

module.exports = new AlbumController();
