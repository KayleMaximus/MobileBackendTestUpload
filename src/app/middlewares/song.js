const axios = require("axios");

const getSongByGenre_API_URL = process.env.API_URL + 'songs/nameGenre';


function getSongIDFromSong(req, res, next) {
  let listRecentSong = req.listRecentSong;

  const songIDs = listRecentSong.map((item) => item.songID);

  req.listSongID = songIDs;

  next();
}

async function getSongByGenre(req, res, next) {
  const listGenre = req.listGenreName;
  let listSong = [];

  try {
    const genrePromises = listGenre.map(async (item) => {
      try {
        if(item == "R&B") item = "R%26B"
        const songs = await axios.get(
          `${getSongByGenre_API_URL}?nameGenre=${item}`
        );

        const songData = songs.data;

        for (let i = 0; i < songData.length; i++) {
            listSong.push(songData[i]);
        }

      } catch (error) {
        console.error("Error:", item, error);
      }
    });

    await Promise.all(genrePromises);
  } catch (error) {
    console.error("Error:", error);
  }

  req.listSong = listSong;

  next();
}

module.exports = {getSongIDFromSong, getSongByGenre};
