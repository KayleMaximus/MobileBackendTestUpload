const { db, storage } = require("../../config/db/firebase");
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

  async getHistoryByUserID(req, res) {
    const userID = req.params.userID;
    console.log(userID);
    try {
      // Truy vấn dữ liệu người dùng từ Firestore
      const userRef = db.collection("listenHistory").where("userID", "==", userID);
      const myUser = await userRef.get();
  
      console.log(myUser);
  
      let userDataList = [];
      myUser.forEach((doc) => {
        userDataList.push(doc.data());
      }); // Lấy tất cả dữ liệu người dùng từ Firestore
  
      res.status(200).json(userDataList);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new ListenHistoryController();
