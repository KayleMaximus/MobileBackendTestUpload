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

  async getHistoryByUserID(req, res) {
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
      }); // Lấy tất cả dữ liệu người dùng từ Firestore

      res.status(200).json(userDataList);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getHistoryByUserIDAndSongID(req, res) {
    const userID = req.query.userID;
    const songID = req.query.songID;

    try {
      // Truy vấn dữ liệu người dùng từ Firestore
      const userRef = db
        .collection("listenHistory")
        .where("userID", "==", userID)
        .where("songID", "==", songID)
        .limit(1);
      const myUser = await userRef.get();

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

  async updateIsLove(req, res) {
    const { userID, songID, isLove } = req.body;

    try {
      // Tìm tài liệu có trường userID phù hợp
      const historyRef = db
        .collection("listenHistory")
        .where("userID", "==", userID)
        .where("songID", "==", songID)
        .limit(1);
      const history = await historyRef.get();

      if (history.empty) {
        // Nếu không tìm thấy tài liệu nào phù hợp
        res.status(404).send("No matching documents found");
      } else {
        // Nếu tìm thấy tài liệu phù hợp
        const doc = history.docs[0];

        // Sử dụng arrayUnion để thêm phần tử vào cuối mảng 'content'
        await doc.ref.update({
          isLove: isLove,
        });

        res.status(200).send("Updated Field Value isLove successfully");
      }
    } catch (error) {
      console.error("Error updating user: ", error);
      res.status(500).send("Internal Server Error");
    }
  }
}

module.exports = new ListenHistoryController();
