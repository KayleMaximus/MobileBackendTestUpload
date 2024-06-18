const { db } = require("../../config/db/firebase");
const ListenHistory = require("../models/ListenHistory");

async function create(req, res) {
  try {
    const { userID, songID, isLove, count } = req.body;

    const now = new Date();

    const newListenHistory = new ListenHistory(
      userID,
      songID,
      now,
      isLove,
      count
    );

    await db.collection("listenHistory").add({
      userID: newListenHistory.userID,
      songID: newListenHistory.songID,
      lastListen: newListenHistory.lastListen,
      isLove: newListenHistory.isLove,
      count: newListenHistory.count,
    });

    res.send("Listen History created successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}

async function update(req, res) {
  const { userID, songID, isLove, count } = req.body; // Destructure data from historyData

  console.log(userID, songID, isLove, count);

  try {
    // Tìm tài liệu có trường id phù hợp
    const historyRef = db
      .collection("listenHistory")
      .where("userID", "==", userID)
      .where("songID", "==", songID)
      .limit(1);

    let history;

    await historyRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        const historyData = doc.data();
        history = new ListenHistory(
          historyData.userID,
          historyData.songID,
          historyData.lastListen,
          historyData.isLove,
          historyData.count
        );
      });
    });

    const updateData = {};

    const now = new Date();

    updateData.lastListen = now;
    if (isLove != undefined || isLove != null) updateData.isLove = isLove;
    if (count) updateData.count = history.count + count;

    const historyToSave = await historyRef.get();
    // Cập nhật chỉ các trường đã được cung cấp trong updatedData
    const doc = historyToSave.docs[0];

    await doc.ref.update(updateData);

    console.log("Listen History updated successfully");
    res.send("Listen History updated successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  create,
  update,
};
