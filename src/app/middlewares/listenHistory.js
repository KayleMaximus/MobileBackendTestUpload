const { query } = require("express");
const { db } = require("../../config/db/firebase");
const listenHistory = require("../utils/listenHistory");
const axios = require("axios");

const listenHistoryAPI_URL =
  "https://mobilebackendtestupload-q7eh.onrender.com/listenHistory/userID";

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

  const listRecentSong = handleRecentSong(response.data)

  req.listRecentSong = listRecentSong;

  next();
}

function handleRecentSong(listSong) {
    const today = new Date();

    const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;

    const filteredData = listSong.filter(item => {
        // Convert lastListen string to Date object
        const lastListenDate = new Date(item.lastListen);
    
        // Calculate the difference between today and lastListen in milliseconds
        const timeDifference = today.getTime() - lastListenDate.getTime();
    
        // Check if timeDifference is less than one week
        return timeDifference < oneWeekInMilliseconds;
      });
    
      return filteredData;
}

module.exports = { checkHistoryExist, getAllListenHistoryByUserID };
