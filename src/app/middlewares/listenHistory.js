const { query } = require("express");
const { db } = require("../../config/db/firebase");
const listenHistory = require("../utils/listenHistory");
const axios = require("axios");


function handleRecent(list) {
  // Tính thời gian hiện tại
  const now = new Date();

  // Tính thời gian cách đây một tuần
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Chuyển đổi thời gian cách đây một tuần sang giây
  const oneWeekAgoSeconds = Math.floor(oneWeekAgo.getTime() / 1000);

  // Lọc các phần tử có lastListen nhỏ hơn một tuần
  return list.filter(item => {
      const lastListenTime = item.lastListen._seconds;
      return lastListenTime > oneWeekAgoSeconds;
  
  });

}

async function checkHistoryExist(req, res, next) {
  const { userID, songID } = req.body;
  try {
    const historyRef = db
      .collection("listenHistory")
      .where("userID", "==", userID)
      .where("songID", "==", songID)
      .limit(1);
    const history = await historyRef.get();

    if (history.empty) {
      console.log("Create...");
      await listenHistory.create(req, res); // Gọi hàm create
    } else {
      console.log("Update...");
      const historyDoc = history.docs[0];
      await listenHistory.update(req, res, historyDoc); // Gửi dữ liệu cho hàm update
    }
  } catch (error) {
    console.error("Error updating user: ", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getListSongIDLoveByUserID(req, res, next) {
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

    const filteredData = userDataList.filter((item) => item.isLove);

    let listSongID = [];
    filteredData.map((item) => {
      listSongID.push(item.songID);
    });

    req.listSongID = listSongID;
    next();

  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getListenHistoryByUserID(req, res, next) {
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

    const listRencent = handleRecent(userDataList)

    listRencent.sort((a, b) => {
      if (a.lastListen._seconds !== b.lastListen._seconds) {
        return b.lastListen._seconds - a.lastListen._seconds; // Sắp xếp giảm dần theo _seconds
      }
      return b.lastListen._nanoseconds - a.lastListen._nanoseconds; // Nếu _seconds bằng nhau, so sánh _nanoseconds
    });

    let listSongID = [];
    listRencent.map((item) => {
      listSongID.push(item.songID);
    });

    req.listSongID = listSongID;
    req.listBaseSort = listRencent;

    next();

  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  checkHistoryExist,
  getListSongIDLoveByUserID,
  getListenHistoryByUserID,
};
