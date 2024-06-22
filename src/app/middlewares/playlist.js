const axios = require("axios");

const getSongBySongID_API_URL = process.env.API_URL + "songs/songID";

async function convertSongIDtoSongName(req, res, next) {
    const {songID} = req.body;
    let songName;
    try {
        const song = await axios.get(
          `${getSongBySongID_API_URL}?songID=${songID}`
        );
        const songData = song.data;
        songName = songData.name;
      } catch (error) {
        console.error("Error:", error);
      }

    req.songName = songName;
    next();
  
}

module.exports = convertSongIDtoSongName;
