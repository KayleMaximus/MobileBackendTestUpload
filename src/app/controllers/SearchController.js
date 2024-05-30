const { db, storage } = require("../../config/db/firebase");
const searchSong = require('../utils/search');
const axios = require('axios');

class SearchController {
    async searchSong(req, res) {
        const query = req.query.query;
        console.log(query);
        try {
          const responseGetAllSongAPI = await axios.get('https://mobilebackendtestupload-q7eh.onrender.com/songs');
          const dataReturn = responseGetAllSongAPI.data;
          const objectReturn = searchSong(query, dataReturn);
          
          res.status(200).send(objectReturn);
          
        } catch (error) {
          console.error("Error fetching user:", error);
          res.status(500).json({ error: "Internal server error" });
        }
      }
}

module.exports = new SearchController();
