const { db, storage } = require("../../config/db/firebase");
const sumaryResponseData = require('../utils/search');

class SearchController {
    async searchSong(req, res) {
        const {query, artist} = req.query;
        console.log(query, artist);
        try {

          const response = await sumaryResponseData(query, artist);
          
          res.status(200).send(response);
          
        } catch (error) {
          console.error("Error fetching user:", error);
          res.status(500).json({ error: "Internal server error" });
        }
      }
}

module.exports = new SearchController();
