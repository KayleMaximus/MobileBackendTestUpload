const { db, storage } = require("../../config/db/firebase");
const Artist = require("../models/Artist");
const { v4: uuidv4 } = require("uuid");
const generateRandomID = require("../utils/randomID");
const { getListSong, getListAlbum } = require("../utils/artist");

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
}

module.exports = new ArtistController();
