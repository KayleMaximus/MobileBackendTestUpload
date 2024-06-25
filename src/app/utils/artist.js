const { db } = require("../../config/db/firebase");
const Artist = require("../models/Artist");
const axios = require("axios");

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

  artists.forEach((element) => {
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

  artists.forEach((element) => {
    console.log(element.listAlbum);
  });

  return artists;
}

async function addSongToListSong(nameArtist, nameSong) {
  console.log("toidayroi");
  console.log(nameArtist, nameSong);
  try {
    // Tìm tài liệu có trường id phù hợp
    const artistRef = db.collection("artists").where("name", "==", nameArtist);
    const myArtist = await artistRef.get();
    let artist;

    if (myArtist.empty) {
      return;
    } else {
      await db
        .collection("artists")
        .where("name", "==", nameArtist)
        .limit(1)
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

      const updatedData = {};

      let listSong = artist.listSong;
      listSong.push(nameSong);
      updatedData.listSong = listSong;

      const doc = myArtist.docs[0];
      await doc.ref.update(updatedData);
    }

    return;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { getListSong, getListAlbum, addSongToListSong };
