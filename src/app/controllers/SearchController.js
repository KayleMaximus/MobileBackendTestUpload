const { db, storage } = require("../../config/db/firebase");
const sumaryResponseData = require('../utils/search');

class SearchController {
    async searchSong(req, res) {
        const {query, song, artist, album} = req.query;
        console.log(query, song, artist, album);
        try {

          const response = await sumaryResponseData(query, song, artist, album);
          
          res.status(200).send(response);
          
        } catch (error) {
          console.error("Error fetching user:", error);
          res.status(500).json({ error: "Internal server error" });
        }
      }
}

module.exports = new SearchController();
