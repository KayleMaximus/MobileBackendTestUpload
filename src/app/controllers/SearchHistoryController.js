const { db, storage } = require("../../config/db/firebase");
const SearchHistory = require("../models/SearchHistory");
const axios = require('axios');

class SearchHistoryController {
  //[GET]
  async index(req, res, next) {
    const list = [];
    await db
      .collection("searchHistory")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const historyData = doc.data();
          const searchHistory = new SearchHistory(
            historyData.userID,
            historyData.history
          );
          list.push(searchHistory);
        });
      })
      .catch(next);
    res.send(list);
  }

  async getHistoryByUserID(req, res) {
    const userID = req.params.userID;
    console.log(userID);
    try {
      // Tìm tài liệu có trường userID phù hợp
      const historyRef = db.collection('searchHistory')
          .where('userID', '==', userID).limit(1);
      const history = await historyRef.get();
  
      if (history.empty) {
          // Nếu không tìm thấy tài liệu nào phù hợp
          res.status(404).send("No matching documents found");
      } else {
          // Nếu tìm thấy tài liệu phù hợp
          const doc = history.docs[0];
          const data = doc.data();
  
          // Kiểm tra nếu 'content' là một mảng, nếu có thì đảo ngược nó
          if (Array.isArray(data.history)) {
              data.history = data.history.slice().reverse(); // Tạo một bản sao của mảng và đảo ngược nó
          }
  
          // Trả về toàn bộ tài liệu với mảng 'content' đã được đảo ngược
          res.status(200).json(data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async searchSong(req, res) {
    const query = req.body;
    try {
      const responseGetAllSongAPI = await axios.get('https://mobilebackendtestupload-q7eh.onrender.com/songs');
      console.log(responseGetAllSongAPI);
      
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new SearchHistoryController();
