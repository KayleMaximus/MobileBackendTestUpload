const axios = require("axios");

//const getSongBySongName_API_URL = "http://localhost:8383/" + "songs/songName";
//const getAlbumByAlbumName_API_URL = "http://localhost:8383/" + "albums/nameAlbum";

const getSongBySongName_API_URL = process.env.API_URL + "songs/songName";
const getAlbumByAlbumName_API_URL = process.env.API_URL + "albums/nameAlbum";

async function getListSong(artists) {
    try {
        const albumPromises = artists.map(async (itemArtist) => {
          console.log(itemArtist.name);
          let listSong = [];
  
          try {
            const songPromises = itemArtist.listSong.map(async (item) => {
              try {
                // console.log()
                const song = await axios.get(
                  `${getSongBySongName_API_URL}?songName=${item}`
                );
  
                const songData = song.data;
                // console.log(songData);
  
                listSong.push(songData);
              } catch (error) {
                console.error("Error:", item, error);
              }
            });
  
            await Promise.all(songPromises);
          } catch (error) {
            console.error("Error fetching user:", error);
          }
  
          itemArtist.listSong = listSong;
  
          });
        await Promise.all(albumPromises);
      } catch (error) {
        console.error("Error fetching user:", error);
      }

      artists.forEach(element => {
        console.log(element.listSong);
      });
      

    return artists; 
}

async function getListAlbum(artists) {
    try {
        const artistPromises = artists.map(async (itemArtist) => {
          console.log(itemArtist.name);
          let listAlbum = [];
  
          try {
            const albumPromises = itemArtist.listAlbum.map(async (item) => {
              try {
                // console.log()
                const album = await axios.get(
                  `${getAlbumByAlbumName_API_URL}?albumName=${item}`
                );
  
                const albumData = album.data;
                // console.log(songData);
  
                listAlbum.push(albumData);
              } catch (error) {
                console.error("Error:", item, error);
              }
            });
  
            await Promise.all(albumPromises);
          } catch (error) {
            console.error("Error fetching user:", error);
          }
  
          itemArtist.listAlbum = listAlbum;
  
          });
        await Promise.all(artistPromises);
      } catch (error) {
        console.error("Error fetching user:", error);
      }

      artists.forEach(element => {
        console.log(element.listAlbum);
      });
      

    return artists; 
}

module.exports = {getListSong, getListAlbum};