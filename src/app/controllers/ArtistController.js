const { db, storage } = require("../../config/db/firebase");
const Artist = require("../models/Artist");
const { v4: uuidv4 } = require("uuid");
const generateRandomID = require("../utils/randomID");
const { getListSong, getListAlbum } = require("../utils/artist");
const axios = require("axios");

const getSongBySongName_API_URL = process.env.API_URL + "songs/songName";
const getAlbumByAlbumName_API_URL = process.env.API_URL + "albums/nameAlbum";

class ArtistController {
  async index(req, res, next) {
    let list = [];
    await db
      .collection("artists")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const artistData = doc.data();
          const artist = new Artist(
            artistData.artistID,
            artistData.name,
            artistData.description,
            artistData.imageURL,
            artistData.listSong,
            artistData.listAlbum
          );
          list.push(artist);
        });
      })
      .catch(next);

    list = await getListSong(list);
    list = await getListAlbum(list);

    res.send(list);
  }

  async create(req, res) {
    const artistID = generateRandomID(23);
    const { name, description, listSong, listAlbum } = req.body;
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

      const newArtist = new Artist(
        artistID,
        name,
        description,
        fileURL.toString(),
        [],
        []
      );
      await db.collection("artists").add({
        artistID: newArtist.artistID,
        name: newArtist.name,
        description: newArtist.description,
        imageURL: newArtist.imageURL,
        listSong: newArtist.listSong,
        listAlbum: newArtist.listAlbum,
      });

      res.status(201).send("Artist created successfully");
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }

  async update(req, res) {
    const artistID = req.params.artistID;
    const { name, description } = req.body;

    // Tạo một object JSON chứa các trường cần cập nhật
    const updatedData = {};

    if (name) updatedData.name = name;
    if (description) updatedData.description = description;

    try {
      // Tìm tài liệu có trường id phù hợp
      const artistRef = db
        .collection("artists")
        .where("artistID", "==", artistID);
      const myArtist = await artistRef.get();

      if (myArtist.empty) {
        res.status(404).send("Artist not found");
        return;
      }

      // Cập nhật chỉ các trường đã được cung cấp trong updatedData
      const doc = myArtist.docs[0];
      await doc.ref.update(updatedData);

      res.status(200).send("Artist updated successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
      res.status(500).send("Internal Server Error");
    }
  }

  async delete(req, res) {
    try {
      const artistID = req.params.artistID;

      const artistRef = db
        .collection("artists")
        .where("artistID", "==", artistID);
      const myArtist = await artistRef.get();

      if (myArtist.empty) {
        res.status(404).send("Artist not found");
        return;
      }

      const doc = myArtist.docs[0];
      await doc.ref.delete();

      res.status(200).send("Artist deleted successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
      res.status(500).send("Internal Server Error");
    }
  }

  //[GET] /nameSong
  async getArtistBySongName(req, res, next) {
    const nameSong = req.query.nameSong;

    let list = [];

    await db
      .collection("artists")
      .where("listSong", "array-contains", nameSong)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const artistData = doc.data();
          const artist = new Artist(
            artistData.artistID,
            artistData.name,
            artistData.description,
            artistData.imageURL,
            artistData.listSong,
            artistData.listAlbum
          );
          list.push(artist);
        });
      })
      .catch(next);
    res.send(list);
  }

  //[GET] /nameAlbum
  async getArtistByAlbumName(req, res, next) {
    const nameAlbum = req.query.nameAlbum;

    let list = [];

    await db
      .collection("artists")
      .where("listAlbum", "array-contains", nameAlbum)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const artistData = doc.data();
          const artist = new Artist(
            artistData.artistID,
            artistData.name,
            artistData.description,
            artistData.imageURL,
            artistData.listSong,
            artistData.listAlbum
          );
          list.push(artist);
        });
      })
      .catch(next);
    res.send(list);
  }

  async getArtistByAritstID(req, res, next) {
    const artistID = req.query.artistID;
    let artist;
    await db
      .collection("artists")
      .where("artistID", "==", artistID)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const artistData = doc.data();
          artist = new Artist(
            artistData.artistID,
            artistData.name,
            artistData.description,
            artistData.imageURL,
            artistData.listSong,
            artistData.listAlbum
          );
        });
      })
      .catch(next);
    res.send(artist);
  }

  async getListSongByAritstID(req, res, next) {
    const artistID = req.query.artistID;
    let artist;
    await db
      .collection("artists")
      .where("artistID", "==", artistID)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const artistData = doc.data();
          artist = new Artist(
            artistData.artistID,
            artistData.name,
            artistData.description,
            artistData.imageURL,
            artistData.listSong,
            artistData.listAlbum
          );
        });
      });

    const listSong = [];

    if (artist.listSong.length > 0) {
      try {
        const songPromises = artist.listSong.map(async (item) => {
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

  async getListAlbumByAritstID(req, res, next) {
    const artistID = req.query.artistID;
    let artist;
    await db
      .collection("artists")
      .where("artistID", "==", artistID)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const artistData = doc.data();
          artist = new Artist(
            artistData.artistID,
            artistData.name,
            artistData.description,
            artistData.imageURL,
            artistData.listSong,
            artistData.listAlbum
          );
        });
      });

    const listAlbum = [];

    if (artist.listAlbum.length > 0) {
      try {
        const albumPromises = artist.listAlbum.map(async (item) => {
          try {
            const album = await axios.get(
              `${getAlbumByAlbumName_API_URL}?albumName=${item}`
            );
            const albumData = album.data;

            listAlbum.push(albumData);
          } catch (error) {
            console.error("Error:", item, error);
          }
        });
        await Promise.all(albumPromises);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    }

    res.status(200).send(listAlbum);
  }
}

module.exports = new ArtistController();
