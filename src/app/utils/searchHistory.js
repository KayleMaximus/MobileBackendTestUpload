const { db, admin } = require("../../config/db/firebase");
const SearchHistory = require("../models/SearchHistory");

async function create(req, res) {
  try {
    const { userID, content } = req.body;

    const newSearchHistory = new SearchHistory(userID, new Array(content));

    console.log(newSearchHistory);

    await db.collection("searchHistory").add({
      userID: newSearchHistory.userID,
      history: newSearchHistory.history,
    });

    res.send("Listen History created successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}

async function update(req, res) {
  const { userID, content } = req.body; // Destructure data from historyData

  try {
    // Tìm tài liệu có trường userID phù hợp
    const historyRef = db
      .collection("searchHistory")
      .where("userID", "==", userID)
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
        history: admin.firestore.FieldValue.arrayUnion(content),
      });

      res.status(200).send("Item added to content array successfully");
    }

    console.log("Item added to content array successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  create,
  update,
};
