const { query } = require("express");
const { db } = require("../../config/db/firebase");
const listenHistory = require("../utils/listenHistory");
const axios = require("axios");

const listenHistoryAPI_URL = process.env.API_URL + "listenHistory/userID";

function handleRecentSong(listSong) {
  const today = new Date();

  const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;

  const filteredData = listSong.filter((item) => {
    // Convert lastListen string to Date object
    const lastListenDate = new Date(item.lastListen);

    // Calculate the difference between today and lastListen in milliseconds
    const timeDifference = today.getTime() - lastListenDate.getTime();

    // Check if timeDifference is less than one week
    return timeDifference < oneWeekInMilliseconds;
  });

  return filteredData;
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

async function getAllListenHistoryByUserID(req, res, next) {
  const userID = req.params.userID;

  const response = await axios.get(`${listenHistoryAPI_URL}?userID=${userID}`);

  const listRecentSong = handleRecentSong(response.data);

  req.listRecentSong = listRecentSong;

  next();
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

    userDataList.sort((a, b) => {
      if (a.lastListen._seconds !== b.lastListen._seconds) {
        return b.lastListen._seconds - a.lastListen._seconds; // Sắp xếp giảm dần theo _seconds
      }
      return b.lastListen._nanoseconds - a.lastListen._nanoseconds; // Nếu _seconds bằng nhau, so sánh _nanoseconds
    });

    let listSongID = [];
    userDataList.map((item) => {
      listSongID.push(item.songID);
    });

    req.listSongID = listSongID;
    req.listBaseSort = userDataList;
    next();

  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  checkHistoryExist,
  getAllListenHistoryByUserID,
  getListSongIDLoveByUserID,
  getListenHistoryByUserID,
};
