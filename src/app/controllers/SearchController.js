const { db, storage } = require("../../config/db/firebase");
const sumaryResponseData = require("../utils/search");

class SearchController {
  async search(req, res) {
    const { query, song, artist, album } = req.query;
    console.log(query, song, artist, album);
    try {
      const response = await sumaryResponseData(query, song, artist, album);

      res.status(200).send(response);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getAllNameData(req, res, next) {
    const list = [];
    await db
      .collection("songs")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const songData = doc.data();
          list.push(songData.name);
        });
      });
    await db
      .collection("artists")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const artistData = doc.data();
          list.push(artistData.name);
        });
      });
    await db
      .collection("albums")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const albumData = doc.data();
          list.push(albumData.name);
        });
      });
    res.send(list);
  }
}

module.exports = new SearchController();
