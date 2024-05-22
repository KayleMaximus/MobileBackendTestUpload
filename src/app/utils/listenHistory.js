const { db } = require("../../config/db/firebase");
const ListenHistory = require("../models/ListenHistory");


async function create(req, res) {
    try{
        const { userID, songID, lastListen, isLove, count } = req.body;

        const newListenHistory = new ListenHistory(userID, songID, lastListen, isLove, count);
        
        console.log(newListenHistory);

        await db.collection('listenHistory').add({
            userID: newListenHistory.userID,
            songID: newListenHistory.songID,
            lastListen: newListenHistory.lastListen,
            isLove: newListenHistory.isLove,
            count: newListenHistory.count,
        }); 

        res.send("Listen History created successfully");
    } catch(error){
        res.status(500).send("Internal Server Error"); 
    }
}

async function update(req, res) {
    const { userID, songID, lastListen, isLove, count } = req.body; // Destructure data from historyData

    console.log( userID, songID, lastListen, isLove, count);

    const updatedData = {};

    if (lastListen) updatedData.lastListen = lastListen;
    if (isLove) updatedData.isLove = isLove;
    if (count) updatedData.count = count;

    try {
        // Tìm tài liệu có trường id phù hợp
        const historyRef = db.collection('listenHistory')
            .where('userID', '==', userID)
            .where('songID', '==', songID).limit(1);
        const history = await historyRef.get();

        // Cập nhật chỉ các trường đã được cung cấp trong updatedData
        const doc = history.docs[0];
        await doc.ref.update(updatedData);

        console.log("Listen History updated successfully");
        res.send("Listen History updated successfully");
    } catch(error){
        res.status(500).send("Internal Server Error"); 
    }
}

module.exports = {
    create,
    update,
};