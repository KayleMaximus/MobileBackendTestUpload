const { db } = require("../../config/db/firebase");
const Playlist = require("../models/Playlist");
const axios = require("axios");

const getSongBySongName_API_URL = process.env.API_URL + "songs/songName";

class PlaylistController {
  async index(req, res, next) {
    const list = [];
    await db
      .collection("playlists")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const playlistData = doc.data();
          const playlist = new Playlist(
            playlistData.userID,
            playlistData.username,
            playlistData.playlistName,
            playlistData.listSong
          );
          list.push(playlist);
        });
      })
      .catch(next);
    res.send(list);
  }

  async create(req, res) {
    try {
      const { userID, username, playlistName, listSong } = req.body;

      try {
        const playlistRef = db
          .collection("playlists")
          .where("userID", "==", userID)
          .where("playlistName", "==", playlistName)
          .limit(1);
        const myPlaylist = await playlistRef.get();

        if (myPlaylist.empty) {
          let newlistSong = [];

          if (listSong.length > 0) {
            newlistSong.push(listSong[0].name);
          }

          const newPlaylist = new Playlist(
            userID,
            username,
            playlistName,
            newlistSong
          );

          await db.collection("playlists").add({
            userID: newPlaylist.userID,
            username: newPlaylist.username,
            playlistName: newPlaylist.playlistName,
            listSong: newPlaylist.listSong,
          });

          res.status(201).send("Playlist created successfully");
        } else {
          res.send(
            "This playlist have exist in your library! Please choose other name!"
          );
        }
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }

  async updateName(req, res) {
    const { userID, playlistName, newPlaylistName } = req.body;

    // Tạo một object JSON chứa các trường cần cập nhật
    const updatedData = {};

    if (newPlaylistName) updatedData.playlistName = newPlaylistName;

    try {
      // Tìm tài liệu có trường id phù hợp
      const playlistRef = db
        .collection("playlists")
        .where("userID", "==", userID)
        .where("playlistName", "==", playlistName)
        .limit(1);
      const myPlaylist = await playlistRef.get();

      if (myPlaylist.empty) {
        res.status(404).send("Playlist not found");
        return;
      }

      // Cập nhật chỉ các trường đã được cung cấp trong updatedData
      const doc = myPlaylist.docs[0];
      await doc.ref.update(updatedData);

      res.status(200).send("Playlist updated successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
      res.status(500).send("Internal Server Error");
    }
  }

  async delete(req, res) {
    try {
      const { userID, playlistName } = req.body;

      const playlistRef = db
        .collection("playlists")
        .where("userID", "==", userID)
        .where("playlistName", "==", playlistName)
        .limit(1);
      const myPlaylist = await playlistRef.get();

      if (myPlaylist.empty) {
        res.status(404).send("Playlist not found");
        return;
      }

      const doc = myPlaylist.docs[0];
      await doc.ref.delete();

      res.status(200).send("Playlist deleted successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
      res.status(500).send("Internal Server Error");
    }
  }

  async getSpecificPlaylist(req, res, next) {
    const { userID, playlistName } = req.body;
    let playlist;
    await db
      .collection("playlists")
      .where("userID", "==", userID)
      .where("playlistName", "==", playlistName)
      .limit(1)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const playlistData = doc.data();
          playlist = new Playlist(
            playlistData.userID,
            playlistData.username,
            playlistData.playlistName,
            playlistData.listSong
          );
        });
      });

    console.log(playlist);

    const listSong = [];

    if (playlist.listSong.length > 0) {
      try {
        const songPromises = playlist.listSong.map(async (item) => {
          try {
            const song = await axios.get(
              `${getSongBySongName_API_URL}?songName=${item}`
            );
            const songData = song.data;

            listSong.push(songData);
          } catch (error) {
            console.error("Error:", item, error);
          }
        });
        await Promise.all(songPromises);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }

      playlist.listSong = listSong;
    }

    console.log(playlist);

    res.status(200).send(playlist);
  }

  async getPlaylistByUserID(req, res, next) {
    const userID = req.params.userID;
    console.log(userID);
    const list = [];
    await db
      .collection("playlists")
      .where("userID", "==", userID)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const playlistData = doc.data();
          const playlist = new Playlist(
            playlistData.userID,
            playlistData.username,
            playlistData.playlistName,
            playlistData.listSong
          );
          list.push(playlist);
        });
      })
      .catch(next);
    res.send(list);
  }

  async addSongToPlaylist(req, res, next) {
    const { userID, playlistName } = req.body;
    const songName = req.songName;

    let playlist;
    await db
      .collection("playlists")
      .where("userID", "==", userID)
      .where("playlistName", "==", playlistName)
      .limit(1)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const playlistData = doc.data();
          playlist = new Playlist(
            playlistData.userID,
            playlistData.username,
            playlistData.playlistName,
            playlistData.listSong
          );
        });
      });

      let listSong = playlist.listSong;
      let isExist = listSong.includes(songName);

      if (isExist) {
          return res.status(500).send("This song already exists in this album");
      } else {
          listSong.push(songName);
      }
    const updatedData = {};

    updatedData.listSong = listSong;

    try {
      // Tìm tài liệu có trường id phù hợp
      const playlistRef = db
        .collection("playlists")
        .where("userID", "==", userID)
        .where("playlistName", "==", playlistName)
        .limit(1);
      const myPlaylist = await playlistRef.get();

      if (myPlaylist.empty) {
        res.status(404).send("Playlist not found");
        return;
      }

      // Cập nhật chỉ các trường đã được cung cấp trong updatedData
      const doc = myPlaylist.docs[0];
      await doc.ref.update(updatedData);

      res.status(200).send("Playlist added song successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
      res.status(500).send("Internal Server Error");
    }
  }

  async deleteSongFromPlaylist(req, res, next) {
    const { userID, playlistName } = req.body;
    const songName = req.songName;

    let playlist;
    await db
      .collection("playlists")
      .where("userID", "==", userID)
      .where("playlistName", "==", playlistName)
      .limit(1)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const playlistData = doc.data();
          playlist = new Playlist(
            playlistData.userID,
            playlistData.username,
            playlistData.playlistName,
            playlistData.listSong
          );
        });
      });

    console.log(playlist);

    let listSong = playlist.listSong;

    if (listSong.length > 0) {
      try {
        listSong = listSong.filter((item) => item !== songName);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    }
    const updatedData = {};

    updatedData.listSong = listSong;

    try {
      // Tìm tài liệu có trường id phù hợp
      const playlistRef = db
        .collection("playlists")
        .where("userID", "==", userID)
        .where("playlistName", "==", playlistName)
        .limit(1);
      const myPlaylist = await playlistRef.get();

      if (myPlaylist.empty) {
        res.status(404).send("Playlist not found");
        return;
      }

      // Cập nhật chỉ các trường đã được cung cấp trong updatedData
      const doc = myPlaylist.docs[0];
      await doc.ref.update(updatedData);

      res.status(200).send("Playlist deleted song successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
      res.status(500).send("Internal Server Error");
    }
  }
}

module.exports = new PlaylistController();
