const { db } = require("../../config/db/firebase");
const ListenHistory = require("../models/ListenHistory");
const axios = require("axios");

//const getSongByGenre_API_URL = process.env.API_URL + 'songs/nameGenre';
const getSongBySongID_API_URL = process.env.API_URL + "songs/songID";
const createHisory_API_URL = process.env.API_URL + "listenHistory";

class ListenHistoryController {
  //[GET]
  async index(req, res, next) {
    const list = [];
    await db
      .collection("listenHistory")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const historyData = doc.data();
          const listenHistory = new ListenHistory(
            historyData.userID,
            historyData.songID,
            historyData.lastListen,
            historyData.isLove,
            historyData.count
          );
          list.push(listenHistory);
        });
      })
      .catch(next);
    res.send(list);
  }

  async getSongLoveByUserID(req, res) {
    const listSongID = req.listSongID;
    let listSong = [];

    try {
      const songPromises = listSongID.map(async (item) => {
        try {
          const song = await axios.get(
            `${getSongBySongID_API_URL}?songID=${item}`
          );

          const songData = song.data;

          listSong.push(songData);
        } catch (error) {
          console.error("Error:", item, error);
        }
      });

      await Promise.all(songPromises);

      res.status(200).send(listSong);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getListenHistoryByUserID(req, res) {
    const listSongID = req.listSongID;
    const listBaseSort = req.listBaseSort;

    let listSong = [];

    console.log(listBaseSort);
    try {
      const songPromises = listSongID.map(async (item) => {
        try {
          const song = await axios.get(
            `${getSongBySongID_API_URL}?songID=${item}`
          );

          const songData = song.data;

          listSong.push(songData);
        } catch (error) {
          console.error("Error:", item, error);
        }
      });

      await Promise.all(songPromises);

      // Tạo một ánh xạ từ id đến chỉ mục trong listA
      const maplistBaseSort = listBaseSort.reduce((acc, item, index) => {
        acc[item.songID] = index;
        return acc;
      }, {});

      // Sắp xếp listB theo thứ tự của listA dựa trên id
      listSong.sort((a, b) => {
        return maplistBaseSort[a.songID] - maplistBaseSort[b.songID];
      });

      res.status(200).json(listSong);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createMultipleHistory(req, res) {
    const {listHistory} = req.body;

    const historyPromises = listHistory.map(async (item) => { 
      try {
        console.log(item);
        await axios.post(createHisory_API_URL, item);
      }catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    })

    await Promise.all(historyPromises);

    res.status(200).send("Create History User Successfully!")
  }
}

module.exports = new ListenHistoryController();
