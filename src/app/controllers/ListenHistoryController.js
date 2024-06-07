const { db } = require("../../config/db/firebase");
const ListenHistory = require("../models/ListenHistory");

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
    const userID = req.query.userID;

    try {
      // Truy vấn dữ liệu người dùng từ Firestore
      const userRef = db
        .collection("listenHistory")
        .where("userID", "==", userID);
      const myUser = await userRef.get();

      let userDataList = [];
      myUser.forEach((doc) => {
        userDataList.push(doc.data());
      }); 

      const filteredData = userDataList.filter(item => item.isLove);

      res.status(200).json(filteredData);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getListenHistoryByUserID(req, res) {
    const userID = req.query.userID;

    try {
      // Truy vấn dữ liệu người dùng từ Firestore
      const userRef = db
        .collection("listenHistory")
        .where("userID", "==", userID);
      const myUser = await userRef.get();

      let userDataList = [];
      myUser.forEach((doc) => {
        userDataList.push(doc.data());
      }); 

      userDataList.sort((a, b) => {
        if (a.lastListen._seconds !== b.lastListen._seconds) {
            return b.lastListen._seconds - a.lastListen._seconds; // Sắp xếp giảm dần theo _seconds
        }
        return b.lastListen._nanoseconds - a.lastListen._nanoseconds; // Nếu _seconds bằng nhau, so sánh _nanoseconds
    });

      res.status(200).json(userDataList);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  
}

module.exports = new ListenHistoryController();
