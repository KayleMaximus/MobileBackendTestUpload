const { db, storage } = require("../../config/db/firebase");
const Album = require("../models/Album");
const { v4: uuidv4 } = require("uuid");
const generateRandomID = require("../utils/randomID");


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
      console.log(albumID, name, fileURL);
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
}

module.exports = new AlbumController();
